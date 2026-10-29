/**
 * Formatting and lookup helpers shared across the usage page.
 *
 * The one rule everything here follows: a missing number and a zero are different things. A Pokemon
 * nobody has a win/loss record for gets a dash, never "0%", which would read as "lost every match".
 */

/** Shown wherever a number genuinely does not exist, rather than a misleading zero. */
export const NO_DATA = "—";

const SPRITE_BASE = "https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ";
/** The placeholder the rest of the site falls back to when a sprite id is missing or 404s. */
export const PLACEHOLDER_SPRITE = `${SPRITE_BASE}/2da163c6-167f-4b7d-5e3d-bbc5cf178b00/public`;

export function spriteUrl(sid) {
  if (sid == null) {
    return PLACEHOLDER_SPRITE;
  }
  return `${SPRITE_BASE}/home_${sid}.png/public`;
}

/** Swaps in the placeholder when a sprite fails to load, without looping if that fails too. */
export function onSpriteError(event) {
  if (event.target.src !== PLACEHOLDER_SPRITE) {
    event.target.src = PLACEHOLDER_SPRITE;
  }
}

export function formatPercent(value, digits = 1) {
  if (value == null || Number.isNaN(value)) {
    return NO_DATA;
  }
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatNumber(value) {
  if (value == null || Number.isNaN(value)) {
    return NO_DATA;
  }
  return value.toLocaleString();
}

/**
 * The change in a rate between two periods, in percentage points.
 *
 * Returns a `kind` rather than just a number so callers can tell the three interesting cases apart:
 * a real change, a Pokemon that has no comparison because it is new, and one that has no comparison
 * because there is no previous period at all.
 */
export function delta(current, previous) {
  if (current == null) {
    return { kind: "none" };
  }
  if (previous == null) {
    return { kind: "new" };
  }
  const change = current - previous;
  return { kind: "change", change };
}

export function formatDelta(value, digits = 1) {
  const points = value * 100;
  // Anything that rounds away to nothing is flat, not a misleading "+0.0".
  if (Math.abs(points) < 10 ** -digits / 2) {
    return "±0";
  }
  return `${points > 0 ? "+" : "−"}${Math.abs(points).toFixed(digits)}`;
}

/**
 * The app's locale codes are not all valid BCP 47 tags, so they are mapped before being handed to
 * Intl. "jp" and "kr" in particular are the app's own spellings of "ja" and "ko".
 */
const LOCALE_TAGS = {
  default: "en-GB", en: "en-GB", es: "es", it: "it", jp: "ja", kr: "ko", pt: "pt", th: "th",
  hi: "hi-IN", bn: "bn-BD", te: "te-IN", ta: "ta-IN",
};

// en-GB rather than en, because plain "en" is month-first ("Aug 24") and these headings read as
// day-month ("24 Aug"). Every other locale here already orders dates the way its readers expect.
const localeTag = (locale) => LOCALE_TAGS[locale] ?? "en-GB";

/**
 * Periods are stored as UTC instants and mean the same calendar days everywhere, so they are always
 * formatted in UTC. Reading them in the viewer's timezone would shift a period by a day either side
 * of the date line.
 */
function dateFormat(locale, withYear) {
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

/**
 * The last moment a window actually covers.
 *
 * `periodEnd` is exclusive, so it must not be shown as-is — a window ending 28 Oct 20:00Z would
 * claim to include the 28th from 20:00 onwards. But subtracting a whole day is wrong too, and was
 * the bug here: the boundary is 20:00Z, not midnight, so a window ending 28 Oct 20:00Z contains
 * nearly all of the 28th. Backing off 24 hours labelled it "27 Oct" and made fresh data read as a
 * day stale. One millisecond back lands on the true last day with data.
 */
const lastMomentOf = (period) => new Date(Date.parse(period?.periodEnd) - 1);

/**
 * Ranges go through Intl's own range formatter, which knows each locale's conventions — English
 * gets "24 Aug – 6 Sep" while Japanese gets "8月24日～9月6日" — rather than gluing two dates
 * together with a dash that only reads correctly in European languages.
 */
function formatRange(format, from, to) {
  if (typeof format.formatRange === "function") {
    return format.formatRange(from, to);
  }
  return `${format.format(from)} \u2013 ${format.format(to)}`;
}

const isValid = (date) => date instanceof Date && !Number.isNaN(date.getTime());

/**
 * Intl throws on an invalid date rather than returning something harmless, which would take the
 * whole page down over one malformed document. A period whose dates are missing gets a dash, the
 * same as any other value we cannot show.
 */
function safely(render, ...dates) {
  if (!dates.every(isValid)) {
    return NO_DATA;
  }
  try {
    return render();
  } catch (ex) {
    return NO_DATA;
  }
}

/** "22 November 2026" — a single date written out, for prose rather than a table. */
export function formatLongDate(timestamp, locale) {
  const date = new Date(timestamp);
  return safely(() => new Intl.DateTimeFormat(localeTag(locale), {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(date), date);
}

/**
 * "6 Sep" — the compact label used on chart axes.
 *
 * Labelled by where the window *ends*, not where it starts. A rolling snapshot is "the seven days
 * up to here", so the end is the date a reader is looking for; labelling by the start made the
 * newest point on the chart read as a week old and the whole series look stale.
 */
export function formatPeriodShort(period, locale) {
  const last = lastMomentOf(period);
  return safely(() => dateFormat(locale, false).format(last), last);
}

/** "24 Aug – 6 Sep 2026", for the heading that has to pin down which period this is. */
export function formatPeriodRange(period, locale) {
  const start = new Date(period?.periodStart);
  const last = lastMomentOf(period);
  return safely(() => formatRange(dateFormat(locale, true), start, last), start, last);
}

/** "24 Aug – 6 Sep", for places further down the page where the year is already established. */
export function formatPeriodRangeShort(period, locale) {
  const start = new Date(period?.periodStart);
  const last = lastMomentOf(period);
  return safely(() => formatRange(dateFormat(locale, false), start, last), start, last);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** How many days one snapshot covers, read off the snapshot rather than assumed. */
export function windowDays(period) {
  const span = Date.parse(period?.periodEnd) - Date.parse(period?.periodStart);
  return Number.isFinite(span) ? Math.round(span / DAY_MS) : 0;
}

/**
 * The snapshot to compare one against: a full window earlier, so the two share no data.
 *
 * Snapshots are taken daily but each covers seven days, so the previous *snapshot* overlaps this
 * one by six days — comparing against it would read ±0.x points on almost every row and convey
 * nothing. Stepping back a whole window gives a genuine week-over-week change.
 *
 * The step is derived from the snapshot's own span rather than hardcoded, so it stays correct if a
 * ruleset is ever given a different window length.
 *
 * When the exact snapshot is missing — thinned by retention, or skipped because that stretch was
 * too quiet to report — the newest older one is used instead, but never more than two windows back.
 * Beyond that the comparison is too stale to call a change, and no chip is better than a wrong one.
 */
export function findComparison(periods, current) {
  if (current == null || periods == null) {
    return null;
  }
  const step = windowDays(current);
  if (step <= 0) {
    return null;
  }
  const target = current.periodIndex - step;
  const exact = periods.find((p) => p.periodIndex === target);
  if (exact != null) {
    return exact;
  }
  return periods
    .filter((p) => p.periodIndex < target && p.periodIndex >= target - step)
    .sort((a, b) => b.periodIndex - a.periodIndex)[0] ?? null;
}

/** Whether a comparison is the exact window back, or a fallback across a gap. */
export function isExactComparison(current, comparison) {
  if (current == null || comparison == null) {
    return false;
  }
  return comparison.periodIndex === current.periodIndex - windowDays(current);
}

/** Looks a species up in a period's light Pokemon list. */
export function findSpecies(period, speciesId) {
  return period?.pokemon?.find((p) => p.speciesId === speciesId) ?? null;
}

/**
 * The y-axis range for a trend chart: scoped to the data instead of anchored at zero.
 *
 * Every metric here is a rate, and the interesting ones live in a narrow band — usage runs roughly
 * 3% to 52%, win rates cluster around 50%. Starting the axis at zero spends most of the chart on
 * empty space and flattens the movement that the chart exists to show.
 *
 * Ported from computeYDomain in dracoviz-site's tournament-graph utils, which solves the same
 * problem for the chart on dracoviz.com. It cannot be imported across the two repos.
 *
 * `decimals` comes back with the range because the two have to agree: once the axis is zoomed into
 * a couple of percentage points, whole-number ticks would repeat the same label several times.
 */
export function computeYDomain(values) {
  const known = (values ?? []).filter((v) => v != null && !Number.isNaN(v));
  // Nothing plotted: fall back to a full-scale axis rather than an inverted or zero-width one.
  if (known.length <= 0) {
    return { min: 0, max: 1, decimals: 0 };
  }

  const lowest = Math.min(...known);
  const highest = Math.max(...known);
  // A flat line has no range to pad, so give it a fixed band and keep it off the axis edge.
  const padding = (highest - lowest) * 0.1 || 0.05;
  const min = Math.max(0, lowest - padding);
  const max = Math.min(1, highest + padding);
  const span = max - min;

  let decimals = 0;
  if (span < 0.005) {
    decimals = 2;
  } else if (span < 0.04) {
    decimals = 1;
  }
  return { min, max, decimals };
}

/**
 * The metrics the trend chart can be plotted against.
 *
 * Shadow rate is deliberately not one of them. It is a property of how people build a given Pokemon
 * rather than of how the meta is moving, so a line of it over time says very little — it still has
 * its own column in the table and its own stat on the drill-down, which is where it is useful.
 */
export const METRICS = [
  { key: "usage", labelKey: "usage_rate", format: formatPercent },
  { key: "matchWinRate", labelKey: "usage_match_win_rate", format: formatPercent },
  { key: "gameWinRate", labelKey: "usage_game_win_rate", format: formatPercent },
];
