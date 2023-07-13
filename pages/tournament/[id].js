import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Router from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import { Alert, AlertTitle, Button } from "@mui/material";
import i18n from "../../i18n";
import { useTranslation } from 'react-i18next';

import styles from "/styles/jss/nextjs-material-kit/pages/tournamentPage.js";

const useStyles = makeStyles(styles);


const testData = {
  name: "Tournament Test",
  description: "Test description",
  bracketLink: "https://www.google.com",
  serverInviteLink: "https://www.google.com",
  maxTeams: 12,
  maxTeamSize: 5,
  matchTeamSize: 3,
  metas: ["Meta 1", "Meta 2", "Meta 3"],
  state: "ROUND_NOT_STARTED",
  factions: [
    {
      name: "Faction 1",
      description: "We the best",
      serverInviteLink: "https://www.google.com",
      players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"],
      positions: ["Player 2", "Player 3", "Player 5"],
      teams: [
        {
          player: "Player 2",
          pokemon: [
            {
              name: "Charizard",
              form: "Mega Y",
              cp: "1498",
              best_buddy: false,
              shadow: true,
              purified: false,
              sid: 194
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1490",
              best_buddy: true,
              shadow: false,
              purified: true,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1493",
              best_buddy: false,
              shadow: false,
              purified: false,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1493",
              best_buddy: false,
              shadow: false,
              purified: false,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1493",
              best_buddy: false,
              shadow: false,
              purified: false,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1496",
              best_buddy: true,
              shadow: true,
              purified: false,
              sid: 224
            },
          ]
        },
        {
          player: "Player 3",
          pokemon: [
            {
              name: "Charizard",
              form: "Mega Y",
              cp: "1498",
              best_buddy: false,
              shadow: true,
              purified: false,
              sid: 194
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1490",
              best_buddy: true,
              shadow: false,
              purified: true,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1493",
              best_buddy: false,
              shadow: false,
              purified: false,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1493",
              best_buddy: false,
              shadow: false,
              purified: false,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1493",
              best_buddy: false,
              shadow: false,
              purified: false,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1496",
              best_buddy: true,
              shadow: true,
              purified: false,
              sid: 224
            },
          ]
        },
        {
          player: "Player 5",
          pokemon: [
            {
              name: "Charizard",
              form: "Mega Y",
              cp: "1498",
              best_buddy: false,
              shadow: true,
              purified: false,
              sid: 194
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1490",
              best_buddy: true,
              shadow: false,
              purified: true,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1493",
              best_buddy: false,
              shadow: false,
              purified: false,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1493",
              best_buddy: false,
              shadow: false,
              purified: false,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1493",
              best_buddy: false,
              shadow: false,
              purified: false,
              sid: 224
            },
            {
              name: "Squirtle",
              form: "",
              cp: "1496",
              best_buddy: true,
              shadow: true,
              purified: false,
              sid: 224
            },
          ]
        }
      ]
    }
  ],

  // Decorated fields
  metaLogos: [
    "https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/4cbccdf9-c0a9-4773-d5d1-3a01755e5100/public",
    "https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/14d2649e-67e9-46c7-872b-26a14f72a500/public",
    "https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/e300ceed-0161-49fb-da65-c12d39ae5500/public",
  ],
  isHost: true,
  isCaptain: true,
}

const statusLabels = {
  "POKEMON_VISIBLE": {
    title: i18n.t('tournament_status_pokemon_visible_title'),
    message: i18n.t('tournament_status_pokemon_visible_message')
  },
  "ROSTERS_VISIBLE": {
    title: i18n.t('tournament_status_rosters_visible_title'),
    message: i18n.t('tournament_status_rosters_visible_message')
  },
  "ROUND_NOT_STARTED": {
    title: i18n.t('tournament_status_round_not_started_title'),
    message: i18n.t('tournament_status_round_not_started_message')
  },
}

const statusColors = {
  "POKEMON_VISIBLE": "success",
  "ROSTERS_VISIBLE": "info",
  "ROUND_NOT_STARTED": "error",
}

export default function Tournament() {
  const { t } = useTranslation();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [currentModal, setCurrentModal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  

  const getTournamentData = (authId) => {
    setData(testData);
  }

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      if (!doesUserExist) {
        Router.push("/login");
      } else {
        const { uid } = user;
        getTournamentData(uid);
      }
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const classes = useStyles();

  const renderAlert = () => {
    if (data == null) {
      return null;
    }
    const { state } = data;
    const { title, message } = statusLabels[state];
    return (
      <Alert severity="info" color={statusColors[state]}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    )
  }

  const renderActionButtons = () => {
    if (data == null) {
      return null;
    }
    const { isHost, isCaptain, state, bracketLink } = data;
    const buttons = [];
    buttons.push(
      <Button
        href={bracketLink}
        target="_blank"
        className={classes.actionButtonMiddle}
        key="SEE_BRACKET"
      >
        {t("tournament_see_bracket_button")}
      </Button>
    );
    if (isHost) {
      if (state === "POKEMON_VISIBLE") {
        buttons.push(
          <Button color="primary" className={classes.actionButtonMiddle} key="HIDE_POKEMON">
            Hide Pokémon
          </Button>
        )
      }
      if (state !== "POKEMON_VISIBLE") {
        buttons.push(
          <Button color="primary" className={classes.actionButtonMiddle} key="SHOW_POKEMON">
            Show Pokémon
          </Button>
        )
      }
      if (state === "ROSTERS_VISIBLE") {
        buttons.push(
          <Button color="primary" className={classes.actionButtonMiddle} key="HIDE_ROSTER">
            Hide Rosters
          </Button>
        )
      }
      if (state === "ROSTERS_HIDDEN") {
        buttons.push(
          <Button color="primary" className={classes.actionButtonMiddle}key="SHOW_ROSTER">
            Show Rosters
          </Button>
        )
      }
      buttons.push(
        <Button color="secondary" key="EDIT_TM">
          Edit Tournament Information
        </Button>
      );
    } else {
      if (isCaptain) {
        buttons.push(
          <Button color="primary" className={classes.actionButtonMiddle} key="EDIT_ROSTER">
            Manage Roster
          </Button>
        )
      }
      const pokemonEditTitle = state !== "POKEMON_VISIBLE" ? t("tournament_edit_pokemon_button") : t("tournament_see_pokemon_button");
      buttons.push(
        <Button color="primary" className={classes.actionButtonMiddle} key="EDIT_POKEMON">
          {pokemonEditTitle}
        </Button>
      );
      buttons.push(
        <Button color="secondary" key="SEE_TM">
          View Tournament Information
        </Button>
      );
    }
    return buttons;
  }

  return (
    <div>
      <Header
        absolute
        color="white"
        rightLinks={<HeaderLinks isSignedIn={isSignedIn} />}
      />
      <div className={classes.pageHeader}>
        <div className={classes.main}>
          <GridContainer justify="center">
            <GridItem xs={12}>
              {renderAlert()}
              <div className={classes.actions}>
                {renderActionButtons()}
              </div>
            </GridItem>
          </GridContainer>
        </div>
      </div>
      <Footer />
    </div>
  );
}