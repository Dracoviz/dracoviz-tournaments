import React from "react";
import { Alert, Button, CircularProgress } from "@mui/material";
import { useTranslation } from "next-i18next";
import Router from "next/router";

/**
 * The screens the usage page shows when it has no data to show.
 *
 * These are deliberately not one generic "something went wrong": failing to reach the API and not
 * being eligible for the data are completely different situations for the person looking at them,
 * and only one of them is worth retrying.
 */

export function UsageLoading({ label }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "40px 0" }}>
      <CircularProgress size={24} />
      <span style={{ opacity: 0.8 }}>{label ?? t("usage_loading")}</span>
    </div>
  );
}

/** A real failure: unreachable API, a 500, malformed JSON. Retrying is worth offering. */
export function UsageError({ onRetry }) {
  const { t } = useTranslation();
  return (
    <Alert
      severity="error"
      style={{ marginTop: 20 }}
      action={onRetry && <Button color="inherit" size="small" onClick={onRetry}>{t("usage_retry")}</Button>}
    >
      <strong>{t("usage_error_title")}</strong>
      <div style={{ marginTop: 4 }}>{t("usage_error_body")}</div>
    </Alert>
  );
}

/**
 * Not a failure. The caller is signed in and everything worked; they just have not hosted or played
 * a tournament with more than three participants in the last 30 days, so this explains how to
 * unlock the data rather than telling them something broke.
 */
export function UsageForbidden() {
  const { t } = useTranslation();
  return (
    <Alert
      severity="info"
      style={{ marginTop: 20 }}
      action={(
        <Button color="inherit" size="small" onClick={() => Router.push("/")}>
          {t("usage_browse_tournaments")}
        </Button>
      )}
    >
      <strong>{t("usage_not_eligible_title")}</strong>
      <div style={{ marginTop: 4 }}>{t("usage_not_eligible_body")}</div>
    </Alert>
  );
}

/**
 * Shown while the page is running on generated data.
 *
 * Deliberately not dismissible: mistaking these numbers for real tournament results is the one
 * failure this page cannot afford, and the notice removes itself once real data is wired up.
 */
export function UsageSampleBanner() {
  const { t } = useTranslation();
  return (
    <Alert severity="warning" style={{ marginBottom: 20 }}>
      <strong>{t("usage_sample_banner_title")}</strong>
      <div style={{ marginTop: 4 }}>{t("usage_sample_banner_body")}</div>
      <div style={{ marginTop: 4 }}>{t("usage_sample_banner_access")}</div>
    </Alert>
  );
}

/** The API worked and there is genuinely nothing stored yet. */
export function UsageEmpty({ message }) {
  const { t } = useTranslation();
  return (
    <Alert severity="info" style={{ marginTop: 20 }}>
      {message ?? t("usage_empty")}
    </Alert>
  );
}
