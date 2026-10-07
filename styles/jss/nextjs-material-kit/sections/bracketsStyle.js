import {  } from "/styles/jss/nextjs-material-kit.js";

function bracketsStyle(theme) {
  const isDark = theme.palette.mode === "dark";
  return {
    rounds: {
      display: "flex",
      flexWrap: "nowrap",
      flexDirection: "row-reverse",
      justifyContent: "space-around",
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
    matchRoot: {
      marginBottom: 20,
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
