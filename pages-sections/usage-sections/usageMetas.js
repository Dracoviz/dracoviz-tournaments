/**
 * The rulesets the usage page publishes, in tab order.
 *
 * Deliberately its own list rather than the app-wide META_OPTIONS in api/getMetaOptions.js: that one
 * is every ruleset a host can run a tournament under, while this is only the ones the offline script
 * actually aggregates. A ruleset appears here when its periods are being computed, not before.
 *
 * `value` must match the key the script is run with and the `meta` field stored on every period
 * document — it is the join between the two halves of the feature.
 */
const USAGE_METAS = [
  { value: "Play Pokemon 2024", labelKey: "usage_meta_play_pokemon" },
  { value: "LAIC 2027", labelKey: "usage_meta_laic_2027" },
];

export const DEFAULT_USAGE_META = USAGE_METAS[0].value;

/** The ruleset a `?meta=` query value refers to, or the default when it names nothing we publish. */
export function resolveUsageMeta(value) {
  return USAGE_METAS.some((m) => m.value === value) ? value : DEFAULT_USAGE_META;
}

export default USAGE_METAS;
