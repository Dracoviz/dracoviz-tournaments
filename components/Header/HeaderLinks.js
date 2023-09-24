/*eslint-disable*/
import React, { useEffect, useState } from "react";
import Link from "next/link";

// @mui/material components
import { makeStyles } from "@mui/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Tooltip from "@mui/material/Tooltip";
import Button from "/components/CustomButtons/Button.js";
import Router, { useRouter } from "next/router";
import firebase from "firebase/compat/app";
import cookie from "react-cookies";
import { useTranslation } from "next-i18next";

import styles from "/styles/jss/nextjs-material-kit/components/headerLinksStyle.js";
import { Select, MenuItem } from "@mui/material";

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
  const router = useRouter();
  const { t } = useTranslation();

  const classes = useStyles();
  const { isSignedIn } = props;
  const currentLang = router.locale;
  const onLangChange = (e) => {
    const locale = e.target.value;
    cookie.save('NEXT_LOCALE', locale);
    router.push({
        pathname: router.pathname,
        query: router.query
      }, {
        pathname: router.pathname,
        query: router.query
      }, { locale }
    );
  }
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
      <ListItem className={classes.listItem} style={{ paddingTop: 10 }}>
        <Select value={currentLang} onChange={onLangChange} variant="standard">
          <MenuItem value="en">🇺🇸 EN</MenuItem>
          <MenuItem value="es">🇪🇸 ES</MenuItem>
        </Select>
      </ListItem>
    </List>
  );
}
