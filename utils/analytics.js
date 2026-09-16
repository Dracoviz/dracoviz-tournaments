/**
 * GA4 event layer for dracoviz-tournaments.
 *
 * This is the ONLY module in the app that touches `gtag` / `dataLayer`.
 * Everything else imports `track`, `trackPageView` or `identify` from here.
 *
 * Hard guarantees this module makes to its callers:
 *   1. It never throws. A blocked or missing gtag (ad blockers are common in
 *      this audience) must never break a submit handler.
 *   2. It never runs on the server. Every page uses getServerSideProps, so
 *      module-level browser access would break the build.
 *   3. It never sends PII. See assertNoPii below.
 */

import {
  PARAM,
  USER_PROP,
  EVENT,
  titleForScreen,
} from './analyticsEvents';

const DEFAULT_MEASUREMENT_ID = 'G-28LT7WYJGW';

export const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID;

// GA4 hard limits. Exceeding these silently drops data, so we clamp and warn.
const MAX_EVENT_NAME_LENGTH = 40;
const MAX_PARAM_COUNT = 25;
const MAX_PARAM_VALUE_LENGTH = 100;

const DEBUG_BUFFER_LIMIT = 250;

const isBrowser = () => typeof window !== 'undefined';

const isProduction = process.env.NODE_ENV === 'production';

let debugMode = false;
let debugResolved = false;
let initialized = false;

/**
 * Debug mode is on in any non-production build, or when `?ga_debug=1` is in the
 * URL. It enables GA4 DebugView and mirrors every event into
 * `window.__dracovizAnalytics` so events can be inspected from the console
 * without opening GA4 at all.
 *
 * Note: DebugView traffic is EXCLUDED from standard GA4 reports, which is why
 * `?ga_debug=1` must stay opt-in in production.
 */
function resolveDebugMode() {
  if (!isBrowser()) return false;
  if (!isProduction) return true;
  try {
    return new URLSearchParams(window.location.search).get('ga_debug') === '1';
  } catch (e) {
    return false;
  }
}

// Events fired before initAnalytics() runs would otherwise miss the debug
// buffer, so resolve eagerly on first use in the browser.
function ensureDebugResolved() {
  if (debugResolved) return;
  debugResolved = true;
  debugMode = resolveDebugMode();
}

/**
 * Whether events are actually sent to GA.
 *
 * Deliberately depends ONLY on the build-time NODE_ENV, never on `window`: this
 * value gates rendering of the gtag <Script> in _app.js, so if it could differ
 * between server and client it would produce a hydration mismatch on every
 * production page load.
 *
 * In development nothing is sent; events still land in
 * `window.__dracovizAnalytics` and the console, which is what dev debugging
 * actually needs.
 */
export function isAnalyticsEnabled() {
  return isProduction;
}

/**
 * Define the dataLayer shim ourselves rather than relying on an inline script.
 * gtag.js drains whatever is already queued in `dataLayer` when it loads, so
 * events fired before the `afterInteractive` script arrives are not lost.
 *
 * Must be a classic function: gtag.js reads the `arguments` object.
 */
function ensureGtag() {
  if (!isBrowser()) return null;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
  return window.gtag;
}

// ---------------------------------------------------------------------------
// PII guard
// ---------------------------------------------------------------------------

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
// Pokemon GO friend codes are 12 digits, often written with spaces or dashes.
const FRIEND_CODE_RE = /(?:\d[\s-]?){12}/;

/**
 * Dev-only tripwire. The app handles display names, friend codes, Discord and
 * Telegram handles, and none of them may ever reach GA. This catches the
 * mistake at the point it is introduced instead of six months of data later.
 */
export function assertNoPii(eventName, params) {
  if (isProduction) return;
  Object.entries(params || {}).forEach(([key, value]) => {
    if (typeof value !== 'string') return;
    if (EMAIL_RE.test(value)) {
      // eslint-disable-next-line no-console
      console.error(`[analytics] PII GUARD: "${eventName}.${key}" looks like an email address. Do not send it.`);
    } else if (FRIEND_CODE_RE.test(value)) {
      // eslint-disable-next-line no-console
      console.error(`[analytics] PII GUARD: "${eventName}.${key}" looks like a friend code. Do not send it.`);
    }
  });
}

// ---------------------------------------------------------------------------
// Param normalization
// ---------------------------------------------------------------------------

function normalizeParams(eventName, params) {
  const out = {};
  let count = 0;

  Object.entries(params || {}).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null || rawValue === '') return;
    if (count >= MAX_PARAM_COUNT) {
      if (!isProduction) {
        // eslint-disable-next-line no-console
        console.warn(`[analytics] "${eventName}" exceeds ${MAX_PARAM_COUNT} params; "${key}" dropped.`);
      }
      return;
    }

    let value = rawValue;
    if (typeof value === 'boolean') {
      value = value ? 'true' : 'false';
    } else if (typeof value !== 'number' && typeof value !== 'string') {
      value = String(value);
    }
    if (typeof value === 'string' && value.length > MAX_PARAM_VALUE_LENGTH) {
      value = value.slice(0, MAX_PARAM_VALUE_LENGTH);
    }

    out[key] = value;
    count += 1;
  });

  return out;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send one GA4 event. Safe to call anywhere, at any time, including before
 * gtag.js has loaded and including during SSR (where it is a no-op).
 */
export function track(eventName, params = {}) {
  try {
    if (!isBrowser()) return;
    if (!eventName) return;

    if (!isProduction && eventName.length > MAX_EVENT_NAME_LENGTH) {
      // eslint-disable-next-line no-console
      console.warn(`[analytics] event name "${eventName}" exceeds ${MAX_EVENT_NAME_LENGTH} chars and will be rejected by GA4.`);
    }

    ensureDebugResolved();
    assertNoPii(eventName, params);
    const payload = normalizeParams(eventName, params);

    if (debugMode) {
      window.__dracovizAnalytics = window.__dracovizAnalytics || [];
      window.__dracovizAnalytics.push({ event: eventName, params: payload, at: Date.now() });
      if (window.__dracovizAnalytics.length > DEBUG_BUFFER_LIMIT) {
        window.__dracovizAnalytics.shift();
      }
      // eslint-disable-next-line no-console
      console.debug('[analytics]', eventName, payload);
    }

    if (!isAnalyticsEnabled()) return;

    const gtag = ensureGtag();
    if (!gtag) return;
    gtag('event', eventName, payload);
  } catch (e) {
    // Analytics must never change control flow.
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] track failed', e);
    }
  }
}

/**
 * Boot GA4. Called once from _app.js.
 *
 * `send_page_view: false` is the crux of the whole overhaul: GA's automatic
 * pageview reports the raw browser URL, which on this app is locale-prefixed
 * and ID-bearing (`/es/tournament/abc123`). We suppress it and send our own
 * normalized page_view instead (see trackPageView).
 */
export function initAnalytics() {
  try {
    if (!isBrowser() || initialized) return;
    initialized = true;
    ensureDebugResolved();

    if (!isAnalyticsEnabled()) return;

    const gtag = ensureGtag();
    if (!gtag) return;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      debug_mode: debugMode,
    });
  } catch (e) {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] init failed', e);
    }
  }
}

/**
 * Send a normalized page_view.
 *
 * GA4 derives its Page path dimension from `page_location`, so we build that
 * from the ROUTE PATTERN (`/tournament/[id]`) rather than the real URL. Twelve
 * readable rows instead of thousands of one-hit rows.
 *
 * The real path survives in `raw_path` -- minus its query string, which can
 * contain the tournament registration password (`?pid=`).
 */
export function trackPageView({ screen, pathname, asPath, locale, params = {} }) {
  let pageLocation = pathname;
  try {
    if (isBrowser()) {
      pageLocation = `${window.location.origin}${pathname}`;
    }
  } catch (e) {
    /* keep the bare pathname */
  }

  track(EVENT.PAGE_VIEW, {
    page_location: pageLocation,
    page_title: titleForScreen(screen),
    [PARAM.SCREEN]: screen,
    [PARAM.LOCALE]: locale,
    [PARAM.RAW_PATH]: stripQuery(asPath),
    ...params,
  });
}

/** Query strings can carry the `?pid=` registration password. Never send them. */
export function stripQuery(path) {
  if (typeof path !== 'string') return undefined;
  return path.split('?')[0].split('#')[0];
}

/**
 * Attach the pseudonymous Firebase uid and role-based user properties.
 *
 * The uid is opaque and is already the `x_session_id` sent to the API, so it
 * introduces no new identifier. Names, emails and friend codes are never sent.
 */
export function identify(uid, userProps = {}) {
  try {
    if (!isBrowser() || !isAnalyticsEnabled()) return;
    const gtag = ensureGtag();
    if (!gtag) return;

    if (uid) {
      gtag('config', GA_MEASUREMENT_ID, {
        user_id: uid,
        send_page_view: false,
        debug_mode: debugMode,
      });
    }

    const props = normalizeParams('user_properties', userProps);
    if (Object.keys(props).length > 0) {
      gtag('set', 'user_properties', props);
    }
  } catch (e) {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] identify failed', e);
    }
  }
}

/** Clear identity on sign-out so the next user is not attributed to this one. */
export function resetIdentity() {
  try {
    if (!isBrowser() || !isAnalyticsEnabled()) return;
    const gtag = ensureGtag();
    if (!gtag) return;
    gtag('config', GA_MEASUREMENT_ID, {
      user_id: null,
      send_page_view: false,
      debug_mode: debugMode,
    });
    gtag('set', 'user_properties', {
      [USER_PROP.IS_HOST]: null,
      [USER_PROP.TOURNAMENTS_HOSTED]: null,
      [USER_PROP.TOURNAMENTS_PLAYED]: null,
      [USER_PROP.HAS_SAVED_TEAMS]: null,
    });
  } catch (e) {
    /* no-op */
  }
}

// ---------------------------------------------------------------------------
// Helpers for building param values
// ---------------------------------------------------------------------------

/**
 * GA4 user properties are strings, and raw counts would explode cardinality.
 * Bucket them.
 */
export function bucketCount(n) {
  const value = Number(n);
  if (!Number.isFinite(value) || value <= 0) return '0';
  if (value <= 3) return '1-3';
  if (value <= 10) return '4-10';
  if (value <= 30) return '11-30';
  return '31+';
}

/**
 * Collapse a bag of boolean config toggles into ONE comma-joined dimension.
 *
 * create-tournament watches ~25 toggles; sending them as 25 params would breach
 * the per-event cap and burn 25 of the 50 available custom dimensions. Only the
 * enabled ones are listed, so "which options do TOs actually turn on" stays a
 * single readable value.
 */
export function configFlags(flags) {
  return Object.entries(flags || {})
    .filter(([, enabled]) => enabled === true)
    .map(([name]) => name)
    .sort()
    .join(',');
}

/** Count how many fields differ, without ever sending the values themselves. */
export function countChangedFields(before, after) {
  if (!before || !after) return undefined;
  return Object.keys(after).filter((key) => before[key] !== after[key]).length;
}
