import React, { useMemo, useState } from "react";
import {
  Button, Chip, CircularProgress, MenuItem, Select, Tooltip,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import UsageTrendChart from "./UsageTrendChart";
import StatDelta from "./StatDelta";
import {
  METRICS, NO_DATA, findSpecies, formatNumber, formatPercent, formatPeriodRange,
  formatPeriodRangeShort, onSpriteError, spriteUrl,
} from "./usageFormat";

/**
 * How many Pokemon the trend chart draws. Hovering a legend entry fades the rest back, so this can
 * be far higher than the number of lines that stay readable when they are all overlaid at once.
 */
const TREND_SERIES = 16;

const COLUMNS = [
  { key: "usage", labelKey: "usage_rate", format: formatPercent, delta: true },
  { key: "matchWinRate", labelKey: "usage_match_win_rate", format: formatPercent, delta: true },
  { key: "gameWinRate", labelKey: "usage_game_win_rate", format: formatPercent, delta: true },
  { key: "shadowRate", labelKey: "usage_shadow_rate", format: formatPercent, delta: false },
  { key: "count", labelKey: "usage_occurrences", format: formatNumber, delta: false },
];

function StatCard({ label, value, current, previous, variant }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "1.5rem", fontWeight: 600 }}>{value}</span>
        <StatDelta current={current} previous={previous} variant={variant} />
      </div>
    </div>
  );
}

export default function UsageOverview({
  periods, onSelectSpecies, onLoadOlder, hasOlder, isLoadingMore,
}) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [metric, setMetric] = useState("usage");
  const [sort, setSort] = useState({ key: "usage", direction: "desc" });

  const period = periods[0];
  const previous = periods[1] ?? null;
  // Deltas and the trend chart only mean anything once there is something to compare against.
  const hasComparison = previous != null;

  const rows = useMemo(() => {
    const list = [...(period?.pokemon ?? [])];
    const { key, direction } = sort;
    list.sort((a, b) => {
      if (key === "speciesName") {
        return direction === "asc"
          ? a.speciesName.localeCompare(b.speciesName)
          : b.speciesName.localeCompare(a.speciesName);
      }
      // Nulls are "no data", not zero, so they sort to the bottom either way rather than pretending
      // to be the worst possible value.
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return direction === "asc" ? av - bv : bv - av;
    });
    return list;
  }, [period, sort]);

  const series = useMemo(() => (period?.pokemon ?? [])
    .slice(0, TREND_SERIES)
    .map((species) => ({
      label: species.speciesName,
      // Null for a period the species did not qualify in, so the line breaks instead of hitting zero.
      valueFor: (p) => findSpecies(p, species.speciesId)?.[metric] ?? null,
    })), [period, metric]);

  const toggleSort = (key) => setSort((prev) => (
    prev.key === key
      ? { key, direction: prev.direction === "desc" ? "asc" : "desc" }
      : { key, direction: key === "speciesName" ? "asc" : "desc" }
  ));

  const sortArrow = (key) => {
    if (sort.key !== key) return "";
    return sort.direction === "desc" ? " ↓" : " ↑";
  };

  const headerCell = (labelKey, key, align = "right") => (
    <th
      key={key}
      onClick={() => toggleSort(key)}
      style={{
        textAlign: align, padding: "8px 10px", cursor: "pointer", whiteSpace: "nowrap",
      }}
    >
      {t(labelKey)}{sortArrow(key)}
    </th>
  );

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>{formatPeriodRange(period, locale)}</h3>
        <Chip size="small" label={t("usage_latest_period")} />
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
        />
        <StatCard
          label={t("usage_teams")}
          value={formatNumber(period.teamCount)}
          current={period.teamCount}
          previous={previous?.teamCount}
          variant="count"
        />
        <StatCard
          label={t("usage_matches")}
          value={formatNumber(period.totalMatches)}
          current={period.totalMatches}
          previous={previous?.totalMatches}
          variant="count"
        />
        <StatCard
          label={t("usage_species_reported")}
          value={formatNumber(period.speciesCount ?? period.pokemon.length)}
          current={period.speciesCount ?? period.pokemon.length}
          previous={previous == null
            ? null
            : (previous.speciesCount ?? previous.pokemon.length)}
          variant="count"
        />
      </div>

      <p style={{ fontSize: "0.82rem", opacity: 0.7, marginBottom: 24 }}>
        {t("usage_threshold_note")}
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
              onChange={(event) => setMetric(event.target.value)}
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
            {t("usage_gap_note")}
          </p>
        </>
      ) : (
        // With a single period there is no trend to draw and every delta would be meaningless.
        <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>{t("usage_single_period")}</p>
      )}

      <h4 style={{ marginTop: 32 }}>
        {t("usage_table_title", { range: formatPeriodRangeShort(period, locale) })}
      </h4>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(128,128,128,0.35)" }}>
              <th style={{ textAlign: "left", padding: "8px 10px", width: 40 }}>#</th>
              {headerCell("usage_pokemon", "speciesName", "left")}
              {COLUMNS.map((column) => headerCell(column.labelKey, column.key))}
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
