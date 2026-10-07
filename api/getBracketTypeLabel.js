// Keep in step with dracoviz-site's db/bracketTypes.js. Note the inconsistent casing
// of the stored values — 'roundrobin' is lowercase while 'singleElim'/'doubleElim' are
// camelCase — these are the strings actually persisted on the session.
export default function getBracketTypeLabel(t) {
  return {
    "none": t("bracket_type_none"),
    "swiss": t("bracket_type_swiss"),
    "roundrobin": t("bracket_type_round_robin"),
    "singleElim": t("bracket_type_single_elim"),
    "doubleElim": t("bracket_type_double_elim"),
  };
}
