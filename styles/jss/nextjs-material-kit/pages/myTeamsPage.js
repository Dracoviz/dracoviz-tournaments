import { main, pageHeader, successColor, warningColor } from "/styles/jss/nextjs-material-kit.js";

const myTeamsPageStyle = {
  main,
  pageHeader,
  teamCard: {
    padding: "15px 25px",
    marginBottom: "15px",
  },
  teamTitle: {
    fontWeight: "500",
    fontSize: "1.1rem",
    margin: 0,
  },
  teamDescription: {
    fontSize: "0.9rem",
    opacity: 0.8,
    margin: "5px 0 0 0",
  },
  teamMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
    marginTop: "10px",
  },
  teamActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },
  valid: {
    color: successColor,
    fontWeight: "500",
  },
  invalid: {
    color: warningColor,
    fontWeight: "500",
  },
}

export default myTeamsPageStyle;
