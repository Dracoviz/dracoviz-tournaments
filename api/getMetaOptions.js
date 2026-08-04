/**
 * The metas players and hosts can pick from.
 *
 * static/rules.json on the API side holds ~80 formats, most of them one-off cup rulesets that are
 * only ever set up by a host who already knows the exact name. This is the curated subset the UI
 * offers; every value here must exist as a key in that file.
 *
 * `label` is a translation key when the meta has one and a literal name when it does not — proper
 * nouns like "NAIC 2026" are not translated.
 */
const META_OPTIONS = [
  { value: "Great League", labelKey: "great_league" },
  { value: "Great League Megas", label: "Anything Goes (Great League)" },
  { value: "Ultra League", labelKey: "ultra_league" },
  { value: "Master League", labelKey: "master_league" },
  { value: "Play Pokemon 2024", label: "Play! Pokémon Championship Series" },
  { value: "NAIC 2026", label: "NAIC 2026" },
];

export const META_VALUES = META_OPTIONS.map((meta) => meta.value);

export const DEFAULT_META = "Great League";

/** `[{ value, label }]` with labels resolved for the current locale. */
export default function getMetaOptions(t) {
  return META_OPTIONS.map(({ value, labelKey, label }) => ({
    value,
    label: labelKey != null ? t(labelKey) : label,
  }));
}

/** The display label for one meta value, falling back to the value for anything uncurated. */
export function getMetaLabel(value, t) {
  const meta = META_OPTIONS.find((m) => m.value === value);
  if (meta == null) {
    return value;
  }
  return meta.labelKey != null ? t(meta.labelKey) : meta.label;
}
