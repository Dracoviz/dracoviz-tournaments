import React, { useState, useEffect } from "react";
import { useTranslation } from 'next-i18next';

// Tuesday April 7, 2026 10:00 PM CDT (UTC-5)
const DOWNTIME_START = new Date("2026-04-08T03:00:00Z");
// Tuesday April 7, 2026 11:00 PM CDT (UTC-5)
const DOWNTIME_END = new Date("2026-04-08T04:00:00Z");

function DowntimeBanner() {
  const { t } = useTranslation();
  const [now, setNow] = useState(new Date());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed || now >= DOWNTIME_END) return null;

  const localStart = DOWNTIME_START.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const localEnd = DOWNTIME_END.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div style={{
      marginTop: 80,
      backgroundColor: "#fff3cd",
      borderBottom: "1px solid #ffecb5",
      color: "#664d03",
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      position: "relative",
    }}>
      <span style={{ fontSize: "1.3em", flexShrink: 0 }}>&#9888;</span>
      <div style={{ flex: 1 }}>
        <strong>{t("downtime_banner_title")}</strong>
        <span style={{ marginLeft: 8 }}>
          {t("downtime_banner_message", { startTime: localStart, endTime: localEnd })}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          color: "#664d03",
          fontSize: "1.3em",
          cursor: "pointer",
          padding: "0 4px",
          lineHeight: 1,
          flexShrink: 0,
          opacity: 0.7,
        }}
      >
        &times;
      </button>
    </div>
  );
}

export { DOWNTIME_START, DOWNTIME_END };
export default DowntimeBanner;
