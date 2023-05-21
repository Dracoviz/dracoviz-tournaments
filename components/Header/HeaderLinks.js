/*eslint-disable*/
import React, { useEffect, useState } from "react";
import Link from "next/link";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "/components/CustomButtons/Button.js";
import Router from "next/router";
import firebase from "firebase/compat/app";

import styles from "/styles/jss/nextjs-material-kit/components/headerLinksStyle.js";

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
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
          title="Follow us on twitter"
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
          title="Join our discord"
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
          id="instagram-tooltip"
          title="Follow us on instagram"
          placement={"top"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            color="transparent"
            href="https://www.instagram.com/dracoviz.co?ref=creativetim"
            target="_blank"
            className={classes.navLink}
          >
            <i className={classes.socialIcons + " fab fa-instagram"} />
          </Button>
        </Tooltip>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Tooltip
            id="instagram-logout"
            title={isSignedIn ? "Log out" : "Log in"}
            placement={"top"}
            classes={{ tooltip: classes.tooltip }}
          >
            <Button
              color="transparent"
              className={classes.registerNavLink}
              onClick={onLoginClick}
            >
              {isSignedIn ? "Log out" : "Log in"}
            </Button>
          </Tooltip>
      </ListItem>
    </List>
  );
}
