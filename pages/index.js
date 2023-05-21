import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Router from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import ProfilePreview from "../pages-sections/home-sections/ProfilePreview";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";

import styles from "/styles/jss/nextjs-material-kit/pages/homePage.js";
console.log(styles);

const useStyles = makeStyles(styles);

const testData = {
  player: {
    name: "Profile 1",
    description: "A rising legend",
    avatar: "https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/Janine.png/public",
    friendCode: "4390 2190 21904",
    discord: "Profile1#1234",
    telegram: "@Profile1",
  }
}

export default function Index() {
  const [isSignedIn, setIsSignedIn] = useState(true);

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

  const renderProfile = () => {
    const { player } = testData;
    const { description, name, avatar } = player;
    return (
      <ProfilePreview description={description} username={name} imageUrl={avatar} />
    )
  }

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
            <GridItem xs={12}>
              {renderProfile()}
            </GridItem>
          </GridContainer>
        </div>
        <Footer />
      </div>
    </div>
  );
}
