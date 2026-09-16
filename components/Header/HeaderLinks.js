/*eslint-disable*/
import React, { useContext } from "react";

// @mui/material components
import { makeStyles } from "@mui/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Tooltip from "@mui/material/Tooltip";
import Button from "/components/CustomButtons/Button.js";
import Router from "next/router";
import firebase from "firebase/compat/app";
import kofi from "../../public/img/kofi.svg";
import { useTranslation } from "next-i18next";

import styles from "/styles/jss/nextjs-material-kit/components/headerLinksStyle.js";
import { useTheme, IconButton } from "@mui/material";
import ColorModeContext from "../../utils/ColorModeContext";
import { track } from "../../utils/analytics";
import { EVENT, PARAM, SOURCE } from "../../utils/analyticsEvents";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const classes = useStyles();
  const { isSignedIn } = props;
  const onLoginClick = () => {
    if (isSignedIn) {
      track(EVENT.LOGOUT);
      firebase.auth().signOut().then(() => {
        Router.push("/login");
      })
    } else {
      track(EVENT.NAV_CLICKED, { [PARAM.SOURCE]: "login" });
      Router.push("/login");
    }
  }

  const onNavClick = (destination) => {
    track(EVENT.NAV_CLICKED, { [PARAM.SOURCE]: destination });
    Router.push(`/${destination}`);
  }

  const onExternalClick = (destination) => {
    track(EVENT.EXTERNAL_LINK_CLICKED, { [PARAM.SOURCE]: destination });
  }
  return (
    <List className={classes.list} style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
      {isSignedIn && (
        <ListItem className={classes.listItem} style={{ width: "auto" }}>
          <Button
            color="transparent"
            className={classes.navLink}
            onClick={() => onNavClick("my-teams")}
          >
            {t("my_teams")}
          </Button>
        </ListItem>
      )}
      {isSignedIn && (
        <ListItem className={classes.listItem} style={{ width: "auto" }}>
          <Button
            color="transparent"
            className={classes.navLink}
            onClick={() => onNavClick("usage")}
          >
            {t("usage")}
          </Button>
        </ListItem>
      )}
      <ListItem className={classes.listItem} style={{ width: "auto" }}>
        <Tooltip
          id="instagram-twitter"
          title={t("header_twitter")}
          placement={"top"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            href="https://twitter.com/Dracoviz?ref=dracoviz"
            onClick={() => onExternalClick("twitter")}
            target="_blank"
            rel="noreferrer"
            color="transparent"
            className={classes.navLink}
            style={{ color: "#1DA1F2" }}
          >
            <i className={classes.socialIcons + " fab fa-twitter"} />
          </Button>
        </Tooltip>
      </ListItem>
      <ListItem className={classes.listItem} style={{ width: "auto" }}>
        <Tooltip
          id="instagram-discord"
          title={t("header_discord")}
          placement={"top"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            color="transparent"
            href="https://discord.gg/tzZM3Ay93f"
            onClick={() => onExternalClick(SOURCE.LINK_DISCORD)}
            target="_blank"
            rel="noreferrer"
            className={classes.navLink}
            style={{ color: "#7289da" }}
          >
            <i className={classes.socialIcons + " fab fa-discord"} />
          </Button>
        </Tooltip>
      </ListItem>
      <ListItem className={classes.listItem} style={{ width: "auto" }}>
        <Tooltip
          id="instagram-kofi"
          title={t("header_kofi")}
          placement={"top"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            color="transparent"
            href="https://ko-fi.com/dracoviz"
            onClick={() => onExternalClick(SOURCE.LINK_KOFI)}
            target="_blank"
            rel="noreferrer"
            className={classes.navLink}
          >
            <img
              className={classes.socialIcons}
              src={kofi.src}
              style={{ marginTop: -3 }}
              height={25}
              width={25}
              alt="kofi"
            />
          </Button>
        </Tooltip>
      </ListItem>
      <ListItem className={classes.listItem} style={{ width: "auto" }}>
        <Tooltip
            id="instagram-lightdark"
            title={t("appearance")}
            placement={"top"}
            classes={{ tooltip: classes.tooltip }}
          >
            <IconButton
              sx={{ mt: 0.5 }}
              onClick={() => {
                track(EVENT.THEME_TOGGLED, {
                  [PARAM.SOURCE]: theme.palette.mode === 'dark' ? 'light' : 'dark',
                });
                colorMode.toggleColorMode();
              }}
              className={classes.navLink}
              color="inherit"
            >
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
      </ListItem>
      <ListItem className={classes.listItem} style={{ width: "auto" }}>
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
