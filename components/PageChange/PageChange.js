import React from "react";

// @mui/material components
import { makeStyles } from "@mui/styles";
import CircularProgress from "@mui/material/CircularProgress";

// core components
import { infoColor, title } from "/styles/jss/nextjs-material-kit.js";

const useStyles = makeStyles({
  progress: {
    color: infoColor,
    width: "6rem !important",
    height: "6rem !important"
  },
  wrapperDiv: {
    margin: "100px auto",
    padding: "0px",
    maxWidth: "360px",
    textAlign: "center",
    position: "relative",
    zIndex: "9999",
    top: "0"
  },
  iconWrapper: {
    display: "block"
  },
  title: {
    ...title,
    color: "#FFFFFF"
  }
});

export default function PageChange(props) {
  const classes = useStyles();
  return (
    <div>
      <div className={classes.wrapperDiv}>
        <div className={classes.iconWrapper}>
          <CircularProgress className={classes.progress} />
        </div>
        <h4 className={classes.title}>
          Loading page contents for: {props.path}
        </h4>
      </div>
    </div>
  );
}
