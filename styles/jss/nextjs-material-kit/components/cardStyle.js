function cardStyle(theme) {
  const isDark = theme.palette.mode === "dark";
  return {
    card: {
      border: "0",
      marginBottom: "20px",
      color: isDark ? "white" : "#343434",
      marginTop: "20px",
      background: isDark ? "#252a31" : "#fff",
      width: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      minWidth: "0",
      wordWrap: "break-word",
      fontSize: ".875rem",
      transition: "all 300ms linear",
      border: isDark ? "none" : "1px solid #F2E5E5",
    },
    cardPlain: {
      background: "transparent",
      boxShadow: "none",
    },
    cardCarousel: {
      overflow: "hidden",
    },
  }
};

export default cardStyle;
