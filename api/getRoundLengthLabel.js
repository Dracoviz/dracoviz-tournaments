export default function getRoundLengthLabel(t) {
  return {
    0: t("round_length_none"),
    15: t("round_length_min", { time: 15 }),
    30: t("round_length_min", { time: 30 }),
    45: t("round_length_min", { time: 45 }),
    60: t("round_length_min", { time: 60 }),
    90: t("round_length_min", { time: 90 }),
    720: t("round_length_hour", { time: 12 }),
    1440: t("round_length_hour", { time: 24 }),
    2880: t("round_length_hour", { time: 48 }),
    4320: t("round_length_hour", { time: 72 }),
    5760: t("round_length_hour", { time: 92 }),
    10080: t("round_length_week")
  };
}
