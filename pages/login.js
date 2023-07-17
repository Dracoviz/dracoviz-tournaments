import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import Card from "/components/Card/Card.js";
import firebase from 'firebase/compat/app';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import CircularProgress from "@mui/material/CircularProgress";
import Router from "next/router";
import i18n from "../i18n";
import { useTranslation } from 'react-i18next';

import styles from "/styles/jss/nextjs-material-kit/pages/loginPage.js";
import fetchApi from "../api/fetchApi";

const useStyles = makeStyles(styles);

export default function LoginPage(props) {
  const { t } = useTranslation();
  const [cardAnimaton, setCardAnimation] = React.useState("cardHidden");
  const [isLoading, setIsLoading] = useState(false);

  const onSignIn = useCallback((user) => {
    setIsLoading(true);
    if (user != null) {
      const { uid } = user;
      fetchApi("shared/login", "GET", {
        "x_session_id": uid,
      })
      .then((response) => {
        if (response.status === 200) {
          // Successfully found user
          Router.push("/");
        } else {
          // Cannot generate user, delete firebase copy
          alert("Failed to log you in. Please try again");
        }
      });
    }
    setIsLoading(false);
  }, []);

  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: (authResult) => {
        const { user } = authResult;
        onSignIn(user);
        return false;
      },
    },
  };

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      onSignIn(user);
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  setTimeout(function () {
    setCardAnimation("");
  }, 700);

  const classes = useStyles();
  const { ...rest } = props;
  return (
    <div>
      <Header
        absolute
        color="white"
        rightLinks={<HeaderLinks isSignedIn={false} />}
        {...rest}
      />
      <div className={classes.pageHeader}>
        <div className={classes.main}>
          <GridContainer>
            <GridItem xs={0} md={2} lg={3}/>
            <GridItem xs={12} md={8} lg={6}>
              <Card className={classes[cardAnimaton]}>
                <div className={classes.card}>
                  <h2>
                    <b>Pokémon GO</b>
                    <br />
                    {t("grassroots_tournaments")}
                  </h2>
                  <p style={{ marginBottom: 40 }}>{t("please_create_account_to_participate")}</p>
                  {isLoading ? <CircularProgress className={classes.progress} /> : <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />}
                </div>
              </Card>
            </GridItem>
          </GridContainer>
        </div>
        <Footer />
      </div>
    </div>
  );
}
