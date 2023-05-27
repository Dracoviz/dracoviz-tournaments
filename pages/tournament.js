import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Router from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import ProfilePreview from "../pages-sections/home-sections/ProfilePreview";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import { Button } from "@mui/material";

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
  state: "POKEMON_VISIBLE",
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
}

export default function Tournament() {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [currentModal, setCurrentModal] = useState(null);

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      if (!doesUserExist) {
        Router.push("/login");
      }
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const classes = useStyles();

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
          </GridContainer>
        </div>
      </div>
    </div>
  );
}