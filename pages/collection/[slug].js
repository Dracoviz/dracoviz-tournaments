import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import { Alert, AlertTitle, Button, CircularProgress, Chip } from "@mui/material";
import { useTranslation } from 'next-i18next';
import Router, { useRouter } from 'next/router';
import Linkify from 'react-linkify';

import styles from "/styles/jss/nextjs-material-kit/pages/tournamentPage.js";
import fetchApi from "../../api/fetchApi";
import getRoundLengthLabel from "../../api/getRoundLengthLabel";
import SinglePlayerList from "../../pages-sections/tournament-sections/SinglePlayerList";
import TournamentInfoModal from "../../pages-sections/tournament-sections/TournamentInfoModal";
import EditTournamentModal from "../../pages-sections/tournament-sections/EditTournamentModal";
import PlayerInfoModal from "../../pages-sections/tournament-sections/PlayerInfoModal";
import FactionList from "../../pages-sections/tournament-sections/FactionList";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Brackets from "../../pages-sections/tournament-sections/Brackets";
import ReportScoreModal from "../../pages-sections/tournament-sections/ReportScoreModal";
import { useForm } from "react-hook-form";
import Countdown from "../../components/Countdown/Countdown";
import TeamSheetModal from "../../pages-sections/tournament-sections/TeamSheetModal";

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'footer',
      ])),
      // Will be passed to the page component as props
    },
  }
}

const useStyles = makeStyles(styles);

export default function Collection() {
  const { t } = useTranslation();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState();
  const router = useRouter();
  const [authId, setAuthId] = useState();
  const { slug } = router.query;
  const classes = useStyles();

  const getCollection = (id) => {
    setAuthId(id);
    setIsLoading(true);
    fetchApi(`series/get?slug=${slug}`, "GET", {
      x_session_id: id,
      x_locale: router.locale,
    })
    .then(response => response.json())
    .then(newData => {
      if (newData.error != null) {
        alert(t(newData.error));
        return;
      }
      setData(newData);
      setIsLoading(false);
    });
  }

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      if (!doesUserExist) {
        Router.push("/login");
      } else {
        getCollection(user.uid);
      }
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  if (isLoading || data == null) {
    return (
      <div>
        <Header
          absolute
          color="white"
          rightLinks={<HeaderLinks isSignedIn={isSignedIn} />}
        />
        <div className={classes.pageHeader}>
          <div className={classes.main}>
            <GridContainer>
              <GridItem xs={12}>
                <CircularProgress />
              </GridItem>
            </GridContainer>
          </div>
        </div>
      </div>
    )
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
          <GridContainer>
            <GridItem xs={12}>
              <h1>{data.name}</h1>
              <p>{data.description}</p>
              <div className={classes.row}>
                <p><b>{t("collection_admins")}</b>: {data.adminNames.length > 0 ? data.adminNames.join(", ") : t("none")}</p>
                {
                  data.isAdmin && (
                    <Button>{t("add_host")}</Button>
                  )
                }
              </div>
              <div className={classes.row}>
                <p><b>{t("collection_hosts")}</b>: {data.hostNames.length > 0 ? data.hostNames.join(", ") : t("none")}</p>
                {
                  data.isAdmin && (
                    <Button>{t("add_admin")}</Button>
                  )
                }
              </div>
              <div className={classes.row}>
                <h2>{t("collection_tournaments")}</h2>
                {
                  (data.isAdmin || data.isHost) && (
                    <Button>{t("add_session")}</Button>
                  )
                }
              </div>
            </GridItem>
          </GridContainer>
        </div>
      </div>
    </div>
  )
}
