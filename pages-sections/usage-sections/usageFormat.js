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
 * The stored period end is exclusive, so the last day of the period is the day before it. Showing
 * the exclusive end would claim every period covers 15 days.
 */
const lastDayOf = (period) => new Date(Date.parse(period.periodEnd) - 24 * 60 * 60 * 1000);

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

/** "24 Aug" — the compact label used on chart axes and period chips. */
export function formatPeriodShort(period, locale) {
  return dateFormat(locale, false).format(new Date(period.periodStart));
}

/** "24 Aug – 6 Sep 2026", for the heading that has to pin down which period this is. */
export function formatPeriodRange(period, locale) {
  return formatRange(dateFormat(locale, true), new Date(period.periodStart), lastDayOf(period));
}

/** "24 Aug – 6 Sep", for places further down the page where the year is already established. */
export function formatPeriodRangeShort(period, locale) {
  return formatRange(dateFormat(locale, false), new Date(period.periodStart), lastDayOf(period));
}

/** Looks a species up in a period's light Pokemon list. */
export function findSpecies(period, speciesId) {
  return period?.pokemon?.find((p) => p.speciesId === speciesId) ?? null;
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
