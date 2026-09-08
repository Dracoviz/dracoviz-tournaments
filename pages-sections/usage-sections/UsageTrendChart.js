import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "@mui/material";
import { useTranslation } from "next-i18next";
import { formatPeriodShort, formatPercent } from "./usageFormat";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler,
);

/**
 * Line colours. The first twelve are ported from the equivalent chart on dracoviz.com so the two
 * read as one product; the rest extend it for the additional lines this chart carries.
 */
const COLORS = [
  "#557AFF", "#E85D5D", "#2DB87A", "#F5A623", "#9B59B6", "#1ABC9C",
  "#E74C3C", "#3498DB", "#F39C12", "#2ECC71", "#E91E8C", "#00BCD4",
  "#8D6E63", "#7E57C2", "#C0CA33", "#546E7A",
];

/** How faint a line goes while a different one is being highlighted. */
const DIMMED_ALPHA = 0.14;

function withAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** The styling one line gets, given which line (if any) is currently focused. */
export function lineStyle(index, focused) {
  const color = COLORS[index % COLORS.length];
  const isDimmed = focused != null && focused !== index;
  return {
    borderColor: isDimmed ? withAlpha(color, DIMMED_ALPHA) : color,
    backgroundColor: isDimmed ? withAlpha(color, DIMMED_ALPHA) : color,
    borderWidth: focused === index ? 3.5 : 2,
    pointRadius: isDimmed ? 0 : 3,
    pointHoverRadius: isDimmed ? 0 : 5,
  };
}

/**
 * Tracks which line is focused and repaints the chart in place when that changes.
 *
 * Kept out of React state on purpose. Chart.js fires the legend's onHover on every mouse move, so
 * routing it through a re-render rebuilds every dataset continuously while the pointer sits in the
 * legend. Mutating the existing datasets and calling update("none") repaints without animating and
 * without React involved at all.
 *
 * Returns whether anything actually changed, so a repeat event for the line already focused costs
 * nothing.
 */
export function createFocusController() {
  let focused = null;
  return {
    get focused() {
      return focused;
    },
    focus(chart, index) {
      if (chart == null || focused === index) {
        return false;
      }
      focused = index;
      chart.data.datasets.forEach((dataset, i) => Object.assign(dataset, lineStyle(i, index)));
      chart.update("none");
      return true;
    },
    reset() {
      focused = null;
    },
  };
}

/**
 * How one metric moved across the loaded periods, one line per Pokemon.
 *
 * Two details carry most of the weight here.
 *
 * The nulls: a Pokemon that did not clear the occurrence threshold in a period has no data for it,
 * which is a different thing from having 0% usage. Those points are null and `spanGaps` is off, so
 * the line genuinely breaks rather than diving to the floor and inventing a collapse that never
 * happened.
 *
 * The highlighting: a dozen-plus lines is more than anyone can follow at once, so hovering a legend
 * entry fades every other line back. That is what makes it possible to plot the whole top of the
 * meta instead of only the handful that stay readable when overlaid.
 *
 * Highlighting is applied by mutating the live chart and calling update("none"), deliberately not by
 * React state. Re-rendering on hover rebuilds every dataset while the pointer is inside the legend,
 * which is both wasteful and visibly jumpy. Dataset `order` is left alone for the same reason: the
 * legend is laid out in that order, so changing it moves the entry out from under the cursor, which
 * fires another hover for a different line and oscillates.
 */
export default function UsageTrendChart({
  periods, series, metric, locale, height = 360,
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isDark = theme.palette.mode === "dark";
  const chartRef = useRef(null);
  const focusRef = useRef(null);
  if (focusRef.current == null) {
    focusRef.current = createFocusController();
  }

  // Periods arrive newest first; a time axis has to read oldest to newest.
  const ordered = useMemo(() => [...periods].reverse(), [periods]);

  const data = useMemo(() => ({
    labels: ordered.map((period) => formatPeriodShort(period, locale)),
    datasets: series.map((entry, i) => ({
      label: entry.label,
      data: ordered.map((period) => entry.valueFor(period)),
      ...lineStyle(i, null),
      tension: 0.25,
      // Never bridge a period the Pokemon was absent from.
      spanGaps: false,
    })),
  }), [ordered, series, locale]);

  const focus = useCallback((index) => focusRef.current.focus(chartRef.current, index), []);

  // A metric or period change rebuilds the datasets unfocused, so drop the stale focus with them.
  useEffect(() => { focusRef.current.reset(); }, [data]);

  const onLegendHover = useCallback((event, item) => {
    if (event?.native?.target != null) {
      event.native.target.style.cursor = "pointer";
    }
    focus(item.datasetIndex);
  }, [focus]);

  const onLegendLeave = useCallback((event) => {
    if (event?.native?.target != null) {
      event.native.target.style.cursor = "default";
    }
    focus(null);
  }, [focus]);

  const options = useMemo(() => {
    const grid = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
    const text = isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.75)";
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", axis: "x", intersect: false },
      plugins: {
        legend: {
          position: "bottom",
          onHover: onLegendHover,
          onLeave: onLegendLeave,
          labels: {
            color: text,
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            padding: 12,
            font: { size: 11 },
          },
        },
        tooltip: {
          callbacks: {
            label: (item) => (item.raw == null
              ? `${item.dataset.label}: ${t("usage_below_threshold_short")}`
              : `${item.dataset.label}: ${formatPercent(item.raw)}`),
          },
        },
      },
      scales: {
        x: { grid: { color: grid }, ticks: { color: text } },
        y: {
          beginAtZero: true,
          grid: { color: grid },
          ticks: { color: text, callback: (value) => formatPercent(value, 0) },
          title: { display: true, text: metric, color: text },
        },
      },
    };
  }, [isDark, metric, t, onLegendHover, onLegendLeave]);

  return (
    <div style={{ height, position: "relative" }}>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}
