import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import Card from "/components/Card/Card.js";
import firebase from 'firebase/compat/app';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import CircularProgress from "@material-ui/core/CircularProgress";
import Router from "next/router";

import styles from "/styles/jss/nextjs-material-kit/pages/loginPage.js";

const useStyles = makeStyles(styles);


export default function LoginPage(props) {
  const [cardAnimaton, setCardAnimation] = React.useState("cardHidden");
  const [isLoading, setIsLoading] = useState(true);

  const onSignIn = useCallback((user) => {
    // TODO: API
    if (user != null) {
      Router.push("/");
      return;
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
          <GridContainer justify="center">
            <GridItem xs={12} sm={6}>
              <Card className={classes[cardAnimaton]}>
                {
                  (isLoading) ? (
                    <CircularProgress className={classes.progress} />
                  ) : (
                    <div className={classes.card}>
                      <h2>
                        <b>Pokémon GO</b>
                        <br />
                        Grassroots Tournaments
                      </h2>
                      <p style={{ marginBottom: 40 }}>Please create an account to participate in community lead tournaments for Pokémon GO PvP</p>
                      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
                    </div>
                  )
                }
              </Card>
            </GridItem>
          </GridContainer>
        </div>
        <Footer />
      </div>
    </div>
  );
}
