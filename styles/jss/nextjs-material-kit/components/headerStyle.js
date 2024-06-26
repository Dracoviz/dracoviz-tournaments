import {
  container,
  hexToRGBAlpha,
  defaultFont,
  primaryColor,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  roseColor,
  transition,
  drawerWidth
} from "/styles/jss/nextjs-material-kit.js";

function headerStyle(theme) {
  const isDark = theme.palette.mode === "dark";
  return {
    appBar: {
      boxShadow: "none",
      display: "flex",
      border: "0",
      borderRadius: "3px",
      padding: "0.625rem 0",
      marginBottom: "20px",
      color: "#555",
      width: "100%",
      backgroundColor: isDark ? "#121212" : "#fff",
      transition: "all 150ms ease 0s",
      alignItems: "center",
      flexFlow: "row nowrap",
      justifyContent: "flex-start",
      position: "relative",
      zIndex: "unset"
    },
    absolute: {
      position: "absolute",
      zIndex: "1100"
    },
    fixed: {
      position: "fixed",
      zIndex: "1100"
    },
    container: {
      ...container,
      minHeight: "50px",
      flex: "1",
      alignItems: "center",
      justifyContent: "space-between",
      display: "flex",
      flexWrap: "nowrap"
    },
    flex: {
      flex: 1
    },
    title: {
      ...defaultFont,
      lineHeight: "30px",
      fontSize: "18px",
      borderRadius: "3px",
      textTransform: "none",
      color: "inherit",
      padding: "8px 16px",
      letterSpacing: "unset",
      "&:hover,&:focus": {
        color: "inherit",
        background: "transparent"
      }
    },
    appResponsive: {
      margin: "20px 10px"
    },
    primary: {
      backgroundColor: primaryColor,
      color: "#FFFFFF",
    },
    info: {
      backgroundColor: infoColor,
      color: "#FFFFFF",
    },
    success: {
      backgroundColor: successColor,
      color: "#FFFFFF",
    },
    warning: {
      backgroundColor: warningColor,
      color: "#FFFFFF",
    },
    danger: {
      backgroundColor: dangerColor,
      color: "#FFFFFF",
    },
    rose: {
      backgroundColor: roseColor,
      color: "#FFFFFF",
    },
    transparent: {
      backgroundColor: "transparent !important",
      boxShadow: "none",
      paddingTop: "25px",
      color: "#FFFFFF"
    },
    dark: {
      color: "#FFFFFF",
      backgroundColor: "#212121 !important",
    },
    white: {
      border: "0",
      padding: "0.625rem 0",
      marginBottom: "20px",
      color: isDark ? "#FFF" : "#555",
      backgroundColor: isDark ? "#000" : "#fff !important",
    },
    drawerPaper: {
      border: "none",
      bottom: "0",
      transitionProperty: "top, bottom, width",
      transitionDuration: ".2s, .2s, .35s",
      transitionTimingFunction: "linear, linear, ease",
      width: drawerWidth,
      position: "fixed",
      display: "block",
      top: "0",
      height: "100vh",
      right: "0",
      left: "auto",
      visibility: "visible",
      overflowY: "visible",
      borderTop: "none",
      textAlign: "left",
      paddingRight: "0px",
      paddingLeft: "0",
      ...transition
    }
  }
};

export default headerStyle;
