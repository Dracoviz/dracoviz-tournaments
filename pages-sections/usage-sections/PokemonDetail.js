import React, { useMemo, useState } from "react";
import { Alert, Button, MenuItem, Select } from "@mui/material";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import formatMove from "../../api/formatMove";
import getMoveIcon from "../../utils/get-moves-icon";
import UsageTrendChart from "./UsageTrendChart";
import StatDelta from "./StatDelta";
import {
  UsageEmpty, UsageError, UsageForbidden, UsageLoading,
} from "./UsageStates";
import { STATUS } from "./useUsageData";
import {
  METRICS, NO_DATA, formatNumber, formatPercent, formatPeriodRange,
  onSpriteError, spriteUrl,
} from "./usageFormat";

function StatCard({ label, value, current, previous }) {
  return (
    <div style={{ minWidth: 110 }}>
      <div style={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "1.4rem", fontWeight: 600 }}>{value}</span>
        <StatDelta current={current} previous={previous} />
      </div>
    </div>
  );
}

function RateCell({ value, teamsWithRecord, t }) {
  if (value == null) {
    return (
      <span
        style={{ opacity: 0.5 }}
        title={t("usage_no_record_tooltip", { teams: teamsWithRecord ?? 0 })}
      >
        {NO_DATA}
      </span>
    );
  }
  return formatPercent(value);
}

/**
 * Everything known about one Pokemon: how it has moved period to period, which movesets people
 * actually bring, and what it is brought alongside.
 *
 * `overviewPeriods` is passed in so the page can tell "this Pokemon was below the reporting
 * threshold that period" apart from "there was no data that period at all" — the species endpoint
 * simply has no document in either case.
 */
export default function PokemonDetail({
  speciesId, overviewPeriods, status, periods, onRetry, onBack,
}) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [metric, setMetric] = useState("usage");

  const current = periods[0] ?? null;
  const previous = periods[1] ?? null;

  /**
   * The species aligned to the overview's periods, so a period it did not qualify in becomes an
   * explicit null the chart can break on rather than a silently missing point.
   */
  const alignedPeriods = useMemo(() => overviewPeriods.map((period) => {
    const match = periods.find((p) => p.periodIndex === period.periodIndex);
    return { ...period, species: match ?? null };
  }), [overviewPeriods, periods]);

  const missingPeriods = alignedPeriods.filter((p) => p.species == null).length;

  const series = useMemo(() => [{
    label: current?.speciesName ?? speciesId,
    valueFor: (period) => alignedPeriods
      .find((p) => p.periodIndex === period.periodIndex)?.species?.[metric] ?? null,
  }], [alignedPeriods, current, metric, speciesId]);

  const backButton = (
    <Button onClick={onBack} style={{ paddingLeft: 0 }}>← {t("usage_back_to_overview")}</Button>
  );

  if (status === STATUS.LOADING) {
    return <div>{backButton}<UsageLoading /></div>;
  }
  if (status === STATUS.FORBIDDEN) {
    return <div>{backButton}<UsageForbidden /></div>;
  }
  if (status === STATUS.ERROR) {
    return <div>{backButton}<UsageError onRetry={onRetry} /></div>;
  }
  if (status === STATUS.EMPTY || current == null) {
    // Either a bad id in the URL, or a Pokemon that never cleared the threshold in these periods.
    return (
      <div>
        {backButton}
        <UsageEmpty message={t("usage_species_no_data", { speciesId })} />
      </div>
    );
  }

  return (
    <div>
      {backButton}

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
        <img
          src={spriteUrl(current.sid)}
          onError={onSpriteError}
          alt=""
          width={72}
          height={72}
          style={{ objectFit: "contain" }}
        />
        <div>
          <h3 style={{ margin: 0 }}>{current.speciesName}</h3>
          <div style={{ opacity: 0.7, fontSize: "0.85rem" }}>{formatPeriodRange(current, locale)}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 26, margin: "20px 0" }}>
        <StatCard
          label={t("usage_rate")}
          value={formatPercent(current.usage)}
          current={current.usage}
          previous={previous?.usage}
        />
        <StatCard
          label={t("usage_match_win_rate")}
          value={<RateCell value={current.matchWinRate} teamsWithRecord={current.teamsWithRecord} t={t} />}
          current={current.matchWinRate}
          previous={previous?.matchWinRate}
        />
        <StatCard
          label={t("usage_game_win_rate")}
          value={<RateCell value={current.gameWinRate} teamsWithRecord={current.teamsWithRecord} t={t} />}
          current={current.gameWinRate}
          previous={previous?.gameWinRate}
        />
        <StatCard
          label={t("usage_shadow_rate")}
          value={formatPercent(current.shadowRate)}
          current={current.shadowRate}
          previous={previous?.shadowRate}
        />
        <div style={{ minWidth: 110 }}>
          <div style={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase" }}>
            {t("usage_occurrences")}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: "1.4rem", fontWeight: 600 }}>
              {formatNumber(current.count)}
            </span>
            <StatDelta current={current.count} previous={previous?.count} variant="count" />
          </div>
        </div>
      </div>

      {overviewPeriods.length > 1 ? (
        <>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 8,
          }}
          >
            <h4 style={{ margin: 0 }}>{t("usage_trend_title", { periods: overviewPeriods.length })}</h4>
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
            periods={overviewPeriods}
            series={series}
            metric={t(METRICS.find((m) => m.key === metric).labelKey)}
            locale={locale}
            height={260}
          />
          {missingPeriods > 0 && (
            <p style={{ fontSize: "0.78rem", opacity: 0.7, marginTop: 8 }}>
              {t("usage_species_gap_note", { periods: missingPeriods })}
            </p>
          )}
        </>
      ) : (
        <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>{t("usage_single_period")}</p>
      )}

      <h4 style={{ marginTop: 32 }}>{t("usage_movesets_title")}</h4>
      {current.movesets.length <= 0 ? (
        <Alert severity="info">{t("usage_no_movesets")}</Alert>
      ) : (
        <>
          <p style={{ fontSize: "0.78rem", opacity: 0.65, marginTop: 0 }}>
            {t("usage_movesets_note", { teams: current.movesetCount ?? current.count })}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(128,128,128,0.35)" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px" }}>{t("usage_moveset")}</th>
                  <th style={{ textAlign: "right", padding: "8px 10px" }}>{t("usage_share")}</th>
                  <th style={{ textAlign: "right", padding: "8px 10px" }}>{t("usage_match_win_rate")}</th>
                  <th style={{ textAlign: "right", padding: "8px 10px" }}>{t("usage_game_win_rate")}</th>
                  <th style={{ textAlign: "right", padding: "8px 10px" }}>{t("usage_occurrences")}</th>
                </tr>
              </thead>
              <tbody>
                {current.movesets.map((moveset) => (
                  <tr
                    key={[moveset.fastMove, ...moveset.chargedMoves].join(",")}
                    style={{ borderBottom: "1px solid rgba(128,128,128,0.18)" }}
                  >
                    <td style={{ padding: "6px 10px" }}>
                      <span style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        <span>{getMoveIcon(moveset.fastMove)} {formatMove(moveset.fastMove, locale)}</span>
                        {moveset.chargedMoves.map((move) => (
                          <span key={move}>{getMoveIcon(move)} {formatMove(move, locale)}</span>
                        ))}
                      </span>
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "right" }}>
                      {formatPercent(moveset.frequency)}
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "right" }}>
                      <RateCell value={moveset.matchWinRate} teamsWithRecord={moveset.teamsWithRecord} t={t} />
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "right" }}>
                      <RateCell value={moveset.gameWinRate} teamsWithRecord={moveset.teamsWithRecord} t={t} />
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "right" }}>
                      {formatNumber(moveset.count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h4 style={{ marginTop: 32 }}>{t("usage_partners_title")}</h4>
      {current.partners.length <= 0 ? (
        <Alert severity="info">{t("usage_no_partners")}</Alert>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(128,128,128,0.35)" }}>
                <th style={{ textAlign: "left", padding: "8px 10px" }}>{t("usage_pokemon")}</th>
                <th style={{ textAlign: "right", padding: "8px 10px" }}>{t("usage_paired")}</th>
                <th style={{ textAlign: "right", padding: "8px 10px" }}>{t("usage_share")}</th>
                <th style={{ textAlign: "right", padding: "8px 10px" }}>{t("usage_match_win_rate")}</th>
              </tr>
            </thead>
            <tbody>
              {current.partners.map((partner) => (
                <tr
                  key={partner.speciesId}
                  style={{ borderBottom: "1px solid rgba(128,128,128,0.18)" }}
                >
                  <td style={{ padding: "6px 10px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img
                        src={spriteUrl(partner.sid)}
                        onError={onSpriteError}
                        alt=""
                        width={30}
                        height={30}
                        style={{ objectFit: "contain" }}
                      />
                      {partner.speciesName}
                    </span>
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    {formatNumber(partner.count)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    {formatPercent(partner.frequency)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    <RateCell value={partner.matchWinRate} teamsWithRecord={partner.teamsWithRecord} t={t} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
