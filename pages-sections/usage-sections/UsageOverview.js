import React, { useMemo, useState } from "react";
import {
  Button, Chip, CircularProgress, MenuItem, Select, Tooltip,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import UsageTrendChart from "./UsageTrendChart";
import StatDelta from "./StatDelta";
import useTableSort from "./useTableSort";
import { track } from "../../utils/analytics";
import { EVENT, PARAM } from "../../utils/analyticsEvents";
import {
  METRICS, NO_DATA, findComparison, findSpecies, formatNumber, formatPercent, formatPeriodRange,
  formatPeriodRangeShort, isExactComparison, onSpriteError, spriteUrl, windowDays,
} from "./usageFormat";

/**
 * How many Pokemon the trend chart draws. Hovering a legend entry fades the rest back, so this can
 * be far higher than the number of lines that stay readable when they are all overlaid at once.
 */
const TREND_SERIES = 16;

/**
 * Only used for periods stored before the threshold was recorded on the document. Every period
 * written from now on carries its own `speciesMinCount`, so the copy always describes the data on
 * screen rather than whatever the constant happens to be today.
 */
const SPECIES_MIN_FALLBACK = 6;

/** The value columns. `delta` marks the ones worth comparing against the window before. */
const COLUMNS = [
  { key: "usage", labelKey: "usage_rate", format: formatPercent, delta: true },
  { key: "matchWinRate", labelKey: "usage_match_win_rate", format: formatPercent, delta: true },
  { key: "gameWinRate", labelKey: "usage_game_win_rate", format: formatPercent, delta: true },
  { key: "shadowRate", labelKey: "usage_shadow_rate", format: formatPercent, delta: false },
  { key: "count", labelKey: "usage_occurrences", format: formatNumber, delta: false },
];

/** The same columns plus the name, in render order, for the sort hook. */
const SORT_COLUMNS = [
  { key: "speciesName", labelKey: "usage_pokemon", align: "left", text: true },
  ...COLUMNS,
];

function StatCard({
  label, value, current, previous, variant, title,
}) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "1.5rem", fontWeight: 600 }}>{value}</span>
        <StatDelta current={current} previous={previous} variant={variant} title={title} />
      </div>
    </div>
  );
}

export default function UsageOverview({
  periods, onSelectSpecies, onLoadOlder, hasOlder, isLoadingMore, isArchived = false,
}) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [metric, setMetric] = useState("usage");
  const { sortRows, SortHeader } = useTableSort(SORT_COLUMNS, "usage");

  const period = periods[0];
  // A whole window back, not the previous snapshot: consecutive snapshots overlap by six days, so
  // comparing against yesterday's would read as no change on almost every row.
  const previous = findComparison(periods, period);
  const hasComparison = previous != null;
  // Stated in the delta tooltips, because a gap in the series means the comparison is sometimes
  // further back than a week and the reader cannot otherwise tell.
  // Read off the snapshot rather than the registry, so it stays right for an older snapshot
  // written when the ruleset used a different window length.
  const days = period?.windowDays ?? windowDays(period) ?? SPECIES_MIN_FALLBACK;
  const comparisonLabel = hasComparison
    ? t(
      isExactComparison(period, previous) ? "usage_delta_vs" : "usage_delta_vs_approx",
      { range: formatPeriodRangeShort(previous, locale), days },
    )
    : undefined;

  const rows = sortRows(period?.pokemon);

  const series = useMemo(() => (period?.pokemon ?? [])
    .slice(0, TREND_SERIES)
    .map((species) => ({
      label: species.speciesName,
      // Null for a period the species did not qualify in, so the line breaks instead of hitting zero.
      valueFor: (p) => findSpecies(p, species.speciesId)?.[metric] ?? null,
    })), [period, metric]);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>{formatPeriodRange(period, locale)}</h3>
        <Chip
          size="small"
          label={isArchived ? t("usage_archived_chip") : t("usage_latest_period", { days })}
        />
      </div>

      <div style={{
        display: "flex", flexWrap: "wrap", gap: 28, margin: "20px 0 8px",
      }}
      >
        <StatCard
          label={t("usage_tournaments")}
          value={formatNumber(period.tournamentCount)}
          current={period.tournamentCount}
          previous={previous?.tournamentCount}
          variant="count"
          title={comparisonLabel}
        />
        <StatCard
          label={t("usage_teams")}
          value={formatNumber(period.teamCount)}
          current={period.teamCount}
          previous={previous?.teamCount}
          variant="count"
          title={comparisonLabel}
        />
        <StatCard
          label={t("usage_matches")}
          value={formatNumber(period.totalMatches)}
          current={period.totalMatches}
          previous={previous?.totalMatches}
          variant="count"
          title={comparisonLabel}
        />
        <StatCard
          label={t("usage_species_reported")}
          value={formatNumber(period.speciesCount ?? period.pokemon.length)}
          current={period.speciesCount ?? period.pokemon.length}
          previous={previous == null
            ? null
            : (previous.speciesCount ?? previous.pokemon.length)}
          variant="count"
          title={comparisonLabel}
        />
      </div>

      <p style={{ fontSize: "0.82rem", opacity: 0.7, marginBottom: 24 }}>
        {t("usage_threshold_note", { min: period.speciesMinCount ?? SPECIES_MIN_FALLBACK, days })}
        {period.teamsWithMovesets != null && period.teamsWithMovesets < period.teamCount && (
          <> {t("usage_moveset_coverage", {
            recorded: period.teamsWithMovesets, total: period.teamCount,
          })}
          </>
        )}
      </p>

      {hasComparison ? (
        <>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 8,
          }}
          >
            <h4 style={{ margin: 0 }}>{t("usage_trend_title", { periods: periods.length })}</h4>
            <Select
              size="small"
              value={metric}
              onChange={(event) => {
                track(EVENT.USAGE_METRIC_CHANGED, { [PARAM.METRIC]: event.target.value });
                setMetric(event.target.value);
              }}
            >
              {METRICS.map((option) => (
                <MenuItem key={option.key} value={option.key}>{t(option.labelKey)}</MenuItem>
              ))}
            </Select>
          </div>
          <UsageTrendChart
            periods={periods}
            series={series}
            metric={t(METRICS.find((m) => m.key === metric).labelKey)}
            locale={locale}
          />
          <p style={{ fontSize: "0.78rem", opacity: 0.65, marginTop: 8 }}>
                {t("usage_gap_note", { min: period.speciesMinCount ?? SPECIES_MIN_FALLBACK })}
          </p>
        </>
      ) : (
        // With a single period there is no trend to draw and every delta would be meaningless.
        <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>{t("usage_single_period", { days })}</p>
      )}

      <h4 style={{ marginTop: 32 }}>
        {t("usage_table_title", { range: formatPeriodRangeShort(period, locale) })}
      </h4>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(128,128,128,0.35)" }}>
              <th style={{ textAlign: "left", padding: "8px 10px", width: 40 }}>#</th>
              {SORT_COLUMNS.map((column) => (
                <SortHeader key={column.key} column={column} />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((species, index) => {
              const before = hasComparison ? findSpecies(previous, species.speciesId) : null;
              return (
                <tr
                  key={species.speciesId}
                  onClick={() => onSelectSpecies(species.speciesId)}
                  style={{
                    borderBottom: "1px solid rgba(128,128,128,0.18)", cursor: "pointer",
                  }}
                >
                  <td style={{ padding: "6px 10px", opacity: 0.6 }}>{index + 1}</td>
                  <td style={{ padding: "6px 10px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img
                        src={spriteUrl(species.sid)}
                        onError={onSpriteError}
                        alt=""
                        width={34}
                        height={34}
                        style={{ objectFit: "contain" }}
                      />
                      <span style={{ fontWeight: 500 }}>{species.speciesName}</span>
                    </span>
                  </td>
                  {COLUMNS.map((column) => {
                    const value = species[column.key];
                    const cell = column.format(value);
                    return (
                      <td key={column.key} style={{ padding: "6px 10px", textAlign: "right" }}>
                        {cell === NO_DATA ? (
                          <Tooltip
                            title={t("usage_no_record_tooltip", {
                              teams: species.teamsWithRecord ?? 0,
                            })}
                          >
                            <span style={{ opacity: 0.5 }}>{NO_DATA}</span>
                          </Tooltip>
                        ) : cell}
                        {column.delta && hasComparison && (
                          <div>
                            <StatDelta
                              current={value}
                              previous={before == null ? null : before[column.key]}
                              title={comparisonLabel}
                            />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasOlder && (
        <div style={{ marginTop: 20 }}>
          <Button onClick={onLoadOlder} disabled={isLoadingMore}>
            {isLoadingMore ? <CircularProgress size={18} /> : t("usage_load_older")}
          </Button>
        </div>
      )}
      {!hasOlder && periods.length > 1 && (
        <p style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: 16 }}>
          {t("usage_all_periods_loaded", { periods: periods.length })}
        </p>
      )}
    </div>
  );
}
