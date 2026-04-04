import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DOWNTIME_END } from "../components/DowntimeBanner/DowntimeBanner";

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default function Downtime() {
  const { t } = useTranslation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const current = new Date();
      setNow(current);
      if (current >= DOWNTIME_END) {
        window.location.href = "/";
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const localEnd = DOWNTIME_END.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <>
      <Head>
        <title>{t("downtime_page_title")}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no"
        />
      </Head>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 20,
        textAlign: "center",
        fontFamily: "Jost, Roboto, sans-serif",
      }}>
        <h1 style={{ fontSize: "2.5em", marginBottom: 10 }}>&#9888; {t("downtime_banner_title")}</h1>
        <p style={{ fontSize: "1.2em", maxWidth: 500, lineHeight: 1.6 }}>
          {t("downtime_page_message", { endTime: localEnd })}
        </p>
        <p style={{ fontSize: "1em", marginTop: 20, opacity: 0.7 }}>
          {t("downtime_page_auto_refresh")}
        </p>
      </div>
    </>
  );
}
