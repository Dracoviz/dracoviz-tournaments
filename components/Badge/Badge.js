import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";

// @mui/material components
import { makeStyles } from "@mui/styles";

import styles from "/styles/jss/nextjs-material-kit/components/badgeStyle.js";

const useStyles = makeStyles(styles);

export default function Badge(props) {
  const classes = useStyles();
  const { color, children, ...rest } = props;
  return (
    <span className={classes.badge + " " + classes[color]} {...rest}>{children}</span>
  );
}

Badge.defaultProps = {
  color: "gray"
};

Badge.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "warning",
    "danger",
    "success",
    "info",
    "rose",
    "gray"
  ]),
  children: PropTypes.node
};
