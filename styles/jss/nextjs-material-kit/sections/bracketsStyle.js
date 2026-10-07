import {  } from "/styles/jss/nextjs-material-kit.js";

function bracketsStyle(theme) {
  const isDark = theme.palette.mode === "dark";
  return {
    rounds: {
      display: "flex",
      flexWrap: "nowrap",
      flexDirection: "row-reverse",
      justifyContent: "space-around",
      // Grow to the width of the columns whenever they do not fit the viewport.
      // Without it the row stays as wide as the scroller, space-around falls back to
      // centring its overflow, and the half that spills past the inline-start edge
      // sits outside the scrollable area — so the far end of a long bracket cannot be
      // reached. When the columns do fit there is no overflow and space-around still
      // spreads them out as before.
      minWidth: "max-content",
    },
    round: {
      display: "flex",
      direction: "ltr",
      flexDirection: "column",
      margin: "0 30px",
    },
    roundLabel: {
      textAlign: "left"
    },
    // Winners / losers switch, shown only for bracket types that have sections.
    sectionTabs: {
      marginBottom: 10,
      "& .MuiTab-root": {
        color: isDark ? "#b6bdc7" : "#555",
        fontWeight: 500,
      },
      "& .Mui-selected": {
        color: isDark ? "#fff" : "#000",
      },
    },
    tabLabel: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    },
    // Count of matches in the current round still waiting on a result.
    tabChip: {
      height: 18,
      minWidth: 18,
      fontSize: 11,
      fontWeight: 700,
      cursor: "inherit",
      "& .MuiChip-label": {
        padding: "0 6px",
      },
    },
    tabReady: {
      color: "#2e9b45",
      fontWeight: 700,
      lineHeight: 1,
    },
    // Final placements. Not inside the horizontal scroller, so it stays readable.
    standings: {
      maxWidth: 560,
      margin: "0 auto",
      padding: "0 16px 20px",
    },
    standingsRow: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "8px 10px",
      borderBottom: isDark ? "solid 1px #3a4049" : "solid 1px #e3e1e1",
    },
    standingsPlace: {
      minWidth: 44,
      fontWeight: 700,
      textAlign: "right",
    },
    standingsName: {
      flex: 1,
      overflowWrap: "anywhere",
    },
    standingsRecord: {
      opacity: 0.75,
      fontSize: 13,
      whiteSpace: "nowrap",
    },
    standingsBuchholz: {
      minWidth: 52,
      textAlign: "right",
      opacity: 0.75,
      fontSize: 13,
      whiteSpace: "nowrap",
    },
    standingsHeader: {
      fontWeight: 700,
      textTransform: "uppercase",
      fontSize: 11,
      letterSpacing: 0.5,
      opacity: 0.6,
      // The Buchholz heading carries a tooltip, so hint that it can be hovered.
      "& span:last-child": {
        cursor: "help",
        textDecoration: "underline dotted",
      },
    },
    matchRoot: {
      marginBottom: 20,
    },
    // Labels and notes sit above and below the match card and are the only things in a
    // column whose width is driven by text. Zero width keeps them out of the
    // max-content measurement above, so a long faction pairing or a translated note
    // wraps inside the column instead of widening every column in the bracket.
    matchText: {
      display: "block",
      width: 0,
      minWidth: "100%",
    },
    matchItem: {
      display: "flex",
      height: 60,
      border: isDark ? "none" : "solid 1px white",
      borderBottom: "none"
    },
    seed: {
      width: 40,
      backgroundColor: "#343434",
      textAlign: "center",
      color: "white",
      padding: "15px 0",
      borderRight: isDark ? "none" : "solid 1px white"
    },
    participants: {
      display: "flex",
    },
    participant: {
      width: 250,
      height: 30,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: 10,
      marginRight: 10,
      color: isDark ? "#000" : "auto",
      borderBottom: isDark ? "none" : "solid 1px white",
    },
    score: {
      minWidth: 30,
      height: 30,
      borderLeft: isDark ? "none" : "solid 1px white",
      paddingTop: 3,
      textAlign: "center"
    }
  }
}

export default bracketsStyle;
