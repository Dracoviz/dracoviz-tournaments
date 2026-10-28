/**
 * The rulesets the usage page publishes, in tab order.
 *
 * Deliberately its own list rather than the app-wide META_OPTIONS in api/getMetaOptions.js: that one
 * is every ruleset a host can run a tournament under, while this is only the ones the offline script
 * actually aggregates. A ruleset appears here when its periods are being computed, not before.
 *
 * `value` must match the key the script is run with and the `meta` field stored on every period
 * document — it is the join between the two halves of the feature.
 *
 * MUST STAY IN STEP with scripts/lib/usageMetas.js in dracoviz-site, which carries the same values
 * and end dates for the offline script and the scheduled job.
 */
const USAGE_METAS = [
  { value: "Play Pokemon 2024", labelKey: "usage_meta_play_pokemon", endsAt: null },
  // LAIC 2027 finishes on 22 Nov 2026. Past that it keeps its snapshots and stays browsable, but
  // gains no more: the chip reads "Final" instead of "Latest", and a notice says so.
  { value: "LAIC 2027", labelKey: "usage_meta_laic_2027", endsAt: Date.UTC(2026, 10, 22, 20) },
];

export const DEFAULT_USAGE_META = USAGE_METAS[0].value;

/** The ruleset a `?meta=` query value refers to, or the default when it names nothing we publish. */
export function resolveUsageMeta(value) {
  return USAGE_METAS.some((m) => m.value === value) ? value : DEFAULT_USAGE_META;
}

/** The end date of a ruleset, or null if it is open-ended. */
export function usageMetaEndsAt(value) {
  return USAGE_METAS.find((m) => m.value === value)?.endsAt ?? null;
}

/** Whether a ruleset has finished, so its snapshots are an archive rather than a live feed. */
export function isUsageMetaArchived(value, now = Date.now()) {
  const endsAt = usageMetaEndsAt(value);
  return endsAt != null && now > endsAt;
}

export default USAGE_METAS;
