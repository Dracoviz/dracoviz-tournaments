import React from "react";
import { useTranslation } from "next-i18next";
import { delta, formatDelta } from "./usageFormat";

/**
 * The change in a value against the previous period.
 *
 * Two variants, because the two kinds of number on this page change in different units: rates move
 * by percentage points ("+2.3"), counts move by whole things ("+14 events").
 *
 * Renders nothing at all when there is nothing honest to say — no previous period loaded, or no
 * value this period — since an empty cell is clearer than a chip that means "unknown".
 */
export default function StatDelta({
  current, previous, variant = "points", digits = 1, title,
}) {
  const { t } = useTranslation();
  const result = delta(current, previous);

  if (result.kind === "none") {
    return null;
  }
  if (result.kind === "new") {
    return (
      <span
        title={t("usage_delta_new_tooltip")}
        style={{
          fontSize: "0.72rem", fontWeight: 600, opacity: 0.75, whiteSpace: "nowrap",
        }}
      >
        {t("usage_delta_new")}
      </span>
    );
  }

  const isCount = variant === "count";
  const magnitude = isCount ? result.change : result.change * 100;
  const isFlat = isCount
    ? Math.round(magnitude) === 0
    : Math.abs(magnitude) < 10 ** -digits / 2;

  const label = isCount
    ? `${magnitude > 0 ? "+" : "−"}${Math.abs(Math.round(magnitude)).toLocaleString()}`
    : formatDelta(result.change, digits);

  return (
    <span
      title={title}
      style={{
        // Green for up, red for down. Direction only: whether "up" is good depends on the metric,
        // which is the reader's call, not the chip's.
        color: isFlat ? undefined : (magnitude > 0 ? "#2e7d32" : "#c62828"),
        opacity: isFlat ? 0.55 : 1,
        fontSize: "0.72rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {isFlat ? "±0" : `${magnitude > 0 ? "▲" : "▼"} ${label.replace(/^[+−]/, "")}`}
    </span>
  );
}
