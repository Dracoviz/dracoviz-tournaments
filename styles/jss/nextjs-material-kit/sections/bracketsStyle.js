import {  } from "/styles/jss/nextjs-material-kit.js";

const bracketsStyle = {
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
  matchRoot: {
    marginBottom: 20,
  },
  matchItem: {
    display: "flex",
    height: 60,
    border: "solid 1px white",
    borderBottom: "none"
  },
  seed: {
    width: 40,
    backgroundColor: "#343434",
    textAlign: "center",
    color: "white",
    padding: "15px 0",
    borderRight: "solid 1px white"
  },
  participant: {
    width: 250,
    height: 30,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 10,
    borderBottom: "solid 1px white",
  },
  score: {
    minWidth: 30,
    height: 30,
    borderLeft: "solid 1px white",
    paddingTop: 3,
    textAlign: "center"
  }
}

export default bracketsStyle;
