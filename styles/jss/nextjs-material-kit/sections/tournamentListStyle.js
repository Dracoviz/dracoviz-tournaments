import { warningColor, dangerColor, infoColor, successColor } from "/styles/jss/nextjs-material-kit.js";

const tournamentListStyle = {
  root: {
    padding: "20px 30px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "10px",
  },
  content: {
    marginLeft: "20px",
    paddingTop: "10px",
  },
  title: {
    fontWeight: "500",
    fontSize: "1.1rem",
  },
  warning: {
    color: warningColor,
  },
  danger: {
    color: dangerColor,
  },
  info: {
    color: infoColor,
  },
  success: {
    color: successColor,
  }
}

export default tournamentListStyle;
