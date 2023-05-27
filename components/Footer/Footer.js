/*eslint-disable*/
import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// nodejs library that concatenates classes
import classNames from "classnames";
import { makeStyles } from "@mui/styles";

import styles from "/styles/jss/nextjs-material-kit/components/footerStyle.js";

const useStyles = makeStyles(styles);

export default function Footer(props) {
  const classes = useStyles();
  const { whiteFont } = props;
  const footerClasses = classNames({
    [classes.footer]: true,
    [classes.footerWhiteFont]: whiteFont
  });
  const aClasses = classNames({
    [classes.a]: true,
    [classes.footerWhiteFont]: whiteFont
  });
  const date = 1900 + new Date().getYear();
  return (
    <footer className={footerClasses}>
      <div className={classes.container}>
        <small>
          {date} Dracoviz. All rights reserved of the original content.
          Pokémon and all other names are the property of The Pokémon Company, Creatures Inc.,
          Game Freak and Nintendo © 1996-{date}
        </small>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  whiteFont: PropTypes.bool
};
