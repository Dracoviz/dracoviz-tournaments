/*eslint-disable*/
import React, { useEffect, useState } from "react";

// @mui/material components
import { makeStyles } from "@mui/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Tooltip from "@mui/material/Tooltip";
import Button from "/components/CustomButtons/Button.js";
import Router from "next/router";
import firebase from "firebase/compat/app";
import { useTranslation } from "next-i18next";

import styles from "/styles/jss/nextjs-material-kit/components/headerLinksStyle.js";

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
  const { t } = useTranslation();

  const classes = useStyles();
  const { isSignedIn } = props;
  const onLoginClick = () => {
    if (isSignedIn) {
      firebase.auth().signOut().then(() => {
        Router.push("/login");
      })
    } else {
      Router.push("/login");
    }
  }
  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        <Tooltip
          id="instagram-twitter"
          title={t("header_twitter")}
          placement={"top"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            href="https://twitter.com/Dracoviz?ref=dracoviz"
            target="_blank"
            color="transparent"
            className={classes.navLink}
          >
            <i className={classes.socialIcons + " fab fa-twitter"} />
          </Button>
        </Tooltip>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Tooltip
          id="instagram-discord"
          title={t("header_discord")}
          placement={"top"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            color="transparent"
            href="https://discord.gg/tzZM3Ay93f"
            target="_blank"
            className={classes.navLink}
          >
            <i className={classes.socialIcons + " fab fa-discord"} />
          </Button>
        </Tooltip>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Tooltip
            id="instagram-logout"
            title={isSignedIn ? t("logout") : t("login")}
            placement={"top"}
            classes={{ tooltip: classes.tooltip }}
          >
            <Button
              color="transparent"
              className={classes.registerNavLink}
              onClick={onLoginClick}
            >
              {isSignedIn ? t("logout") : t("login")}
            </Button>
          </Tooltip>
      </ListItem>
    </List>
  );
}
