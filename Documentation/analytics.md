# Analytics

GA4 property `G-28LT7WYJGW`. All instrumentation goes through `utils/analytics.js`;
nothing else in the app touches `gtag` or `dataLayer`.

## Why it is built this way

The app has locale-prefixed, id-bearing URLs (`/es/tournament/abc123`). GA's
automatic pageview reports that raw URL, so the Pages report was thousands of
one-hit rows across 7 locales instead of a dozen screens. Three things follow
from that:

1. **`send_page_view: false`.** We suppress GA's automatic pageview and send our
   own from `utils/useAnalyticsPageTracking.js`, with `page_location` built from
   `router.pathname` — the route *pattern*, `/tournament/[id]`. Twelve readable
   rows. The real path survives in `raw_path` and the id in `tournament_id`, so
   per-tournament analysis is still possible in an exploration.
2. **The loader lives in `pages/_app.js`**, not in a page component. It used to
   sit inside `<Header>`, so `404.js` and `_error.js` were invisible and
   client-side navigations were never recorded at all.
3. **Many event names, one small parameter set.** GA4 caps a property at 50
   event-scoped and 25 user-scoped custom dimensions. Bespoke parameters per
   event would exhaust that budget and leave the data unreportable.

## Adding an event

```js
import { track } from "../utils/analytics";
import { EVENT, PARAM, RESULT } from "../utils/analyticsEvents";

track(EVENT.BRACKET_STARTED, {
  [PARAM.TOURNAMENT_ID]: id,
  [PARAM.ROLE]: analyticsRole(),
  [PARAM.RESULT]: RESULT.SUCCESS,
});
```

Rules:

- **Reuse `PARAM`.** Add a new parameter only when nothing existing fits, and
  register it in GA4 (below) the same day — registration is not retroactive.
- **Name events in `analyticsEvents.js`**, never as inline strings.
- **Never send PII.** No names, emails, friend codes, Discord/Telegram handles,
  or search query text. Send a length or a count instead. `assertNoPii` will
  console-error in development if an email or friend code slips through, but it
  is a backstop, not a substitute for thinking.
- **`track` never throws and never blocks.** Do not make control flow depend on
  it.

### Success, failure, cancellation

Every action event carries `result` (`success` / `failure` / `cancelled`) and,
on failure, `error_code` — the `api_*` i18n key, which is already a clean enum.

Separate `*_failed` event names exist **only** for the four funnel-critical
steps, where "created: failure" would be a nonsense row: `login_failed`,
`tournament_create_failed`, `join_failed`, `team_register_failed`. Everywhere
else, one event name plus `result`.

Cancellations matter here: the app uses native `confirm()`/`prompt()` with no
toast system, so an aborted destructive action leaves no other trace.

## Viewing events without GA4

In development nothing is sent to GA. Events still go to the console and to
`window.__dracovizAnalytics`:

```js
window.__dracovizAnalytics          // [{ event, params, at }, ...]
```

In production, `?ga_debug=1` enables GA4 DebugView plus the same buffer. Keep it
opt-in: **DebugView traffic is excluded from standard reports.**

## Identity

`identify()` sets the Firebase `uid` as GA4's `user_id`. It is opaque and is
already sent to the API as `x_session_id`, so it introduces no new identifier.

User properties are set from the `shared/get/` response the home page already
fetches, so they cost no extra request. Counts are **bucketed strings**
(`0`, `1-3`, `4-10`, `11-30`, `31+`) — GA4 user properties are strings, and raw
counts would explode cardinality.

| Property | Meaning |
|---|---|
| `is_host` | has hosted at least one tournament |
| `tournaments_hosted` | bucketed count |
| `tournaments_played` | bucketed count |
| `app_locale` | UI language |
| `theme` | light / dark |

`role` (event-scoped: `host` / `player` / `captain` / `spectator` / `guest`) is
the one to reach for first — it is what makes "which features do TOs use vs.
players" answerable.

## Event-scoped parameters — register ALL of these

GA4 Admin → Custom definitions → Create custom dimension, scope **Event**:

`screen`, `locale`, `role`, `tournament_id`, `bracket_type`, `tournament_state`,
`to_state`, `is_team_tournament`, `meta`, `source`, `result`, `error_code`,
`item_count`, `duration_ms`, `species_id`, `endpoint`, `raw_path`,
`config_flags`, `method`, `provider`, `is_new_user`, `round_index`,
`query_length`, `field_count`, `metric`, `sort_column`, `saved_to_library`

Plus user-scoped: `is_host`, `tournaments_hosted`, `tournaments_played`,
`has_saved_teams`, `app_locale`, `theme`.

That is 27 of 50 event-scoped and 6 of 25 user-scoped slots.

`config_flags` is worth understanding: it collapses a bag of booleans into one
comma-joined value listing only what is enabled (`"priv,hide_guest,kick"`). The
create-tournament form alone has ~25 toggles; as separate parameters they would
breach the 25-per-event cap and burn half the property's dimensions.

## Remaining GA4 setup (not code)

1. Register every dimension above. **Not retroactive** — events sent before
   registration are unreportable forever.
2. **Disable Enhanced measurement → "Page changes based on browser history
   events"** (Admin → Data streams → the web stream). Next.js `pushState`
   navigations otherwise trigger a second, raw-URL pageview that undoes the
   normalization.
3. Mark as Key events: `tournament_created`, `joined_tournament`,
   `team_registered`, `score_reported`, `login_succeeded`.
4. Raise event data retention to 14 months (the 2-month default silently
   discards history).
5. Add internal-traffic / `localhost` exclusion filters.
6. Annotate the cutover date — `page_location` changes meaning from that point,
   so older rows are not comparable.

## Funnels to build

Funnel steps that are just "reached the screen" use `page_view` filtered on
`screen`, rather than a duplicate `*_viewed` event.

**TO funnel:** `page_view`(screen=`create_tournament`) → `tournament_preset_applied`
→ `tournament_create_submitted` → `tournament_created` → `bracket_started` →
`tournament_concluded`

**Player funnel:** `page_view`(screen=`join_tournament`) → `join_submitted` →
`joined_tournament` → `team_registered` → `score_reported`

Two questions worth asking on day one:

- **`usage_access_denied`** — how many people hit the 30-day-activity
  eligibility gate on the usage page. This is the highest-signal single number
  in the property.
- **`share_link_copied` → `join_submitted{source: deep_link}`** — the invite
  loop, end to end.

## Where the events live

| Area | File |
|---|---|
| Core, identity, PII guard | `utils/analytics.js` |
| Names, screens, vocabulary | `utils/analyticsEvents.js` |
| Pageviews + route timing | `utils/useAnalyticsPageTracking.js` |
| Identity binding | `utils/useAnalyticsIdentity.js` |
| API errors and slow calls | `api/fetchApi.js` |
| Tournament hub (~20 events) | `pages/tournament/[id].js` |

`api/fetchApi.js` is the seam every one of the ~38 API call sites passes
through. It emits `api_error` on transport failure and `api_slow` above 3s —
deliberately **not** an event per call, which would roughly double hit volume.
Handlers that receive `{ error: "api_*" }` with HTTP 200 report it themselves,
or via the exported `trackApiResult`.
