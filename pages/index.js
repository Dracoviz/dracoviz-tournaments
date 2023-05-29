import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Router from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import ProfilePreview from "../pages-sections/home-sections/ProfilePreview";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import fetchApi from "../api/fetchApi.js";

import styles from "/styles/jss/nextjs-material-kit/pages/homePage.js";
import { Button, CircularProgress } from "@mui/material";
import TournamentList from "../pages-sections/home-sections/TournamentList";
import ProfileEditModal from "../pages-sections/home-sections/ProfileEditModal";

const useStyles = makeStyles(styles);

export default function Index() {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [currentModal, setCurrentModal] = useState(null);
  const [data, setData] = useState(null);

  const getSharedData = useCallback((authId) => {
    fetchApi("shared/get", "GET", {
      x_session_id: authId,
    })
    .then(response => response.json())
    .then(newData => setData(newData));
  }, [])

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      if (!doesUserExist) {
        Router.push("/login");
      } else {
        getSharedData(user.uid);
      }
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const onEditProfile = () => {
    setCurrentModal("profile");
  }

  const closeModal = () => {
    setCurrentModal(null);
  }

  const renderProfile = () => {
    const { description, name, avatar } = data;
    return (
      <ProfilePreview
        description={description}
        username={name}
        imageUrl={avatar}
        onClick={onEditProfile}
      />
    )
  }

  const renderTournaments = () => {
    const { sessions } = data;
    return (
      <TournamentList sessions={sessions} />
    )
  }

  const renderEditProfileModal = () => {
    return (
      <ProfileEditModal 
        open={currentModal === "profile"}
        onClose={closeModal}
        player={data}
      />
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
          {renderEditProfileModal()}
          <GridContainer>
            {
              data == null ? (
                <CircularProgress />
              ) : (
                <>
                  <GridItem xs={12}>
                    {renderProfile()}
                  </GridItem>
                  <GridItem xs={12}>
                    <div className={classes.tournamentHead}>
                      <h3>Your Tournaments</h3>
                      <div>
                        <Button color="primary" href="/join-tournament">
                          Join a Tournament
                        </Button>
                        <Button color="primary" style={{ marginLeft: 20 }} href="/create-tournament">
                          Create a Tournament
                        </Button>
                      </div>
                    </div>
                  </GridItem>
                  <GridItem xs={12}>
                    {renderTournaments()}
                  </GridItem>
                </>
              )
            }
          </GridContainer>
        </div>
        <Footer />
      </div>
    </div>
  );
}
