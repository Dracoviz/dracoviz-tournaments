import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import { Alert, AlertTitle, Button, CircularProgress } from "@mui/material";
import i18n from "../../i18n";
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import styles from "/styles/jss/nextjs-material-kit/pages/tournamentPage.js";
import fetchApi from "../../api/fetchApi";
import SinglePlayerList from "../../pages-sections/tournament-sections/SinglePlayerList";
import TournamentInfoModal from "../../pages-sections/tournament-sections/TournamentInfoModal";
import PlayerInfoModal from "../../pages-sections/tournament-sections/PlayerInfoModal";
import FactionList from "../../pages-sections/tournament-sections/FactionList";

const useStyles = makeStyles(styles);

const statusLabels = {
  "POKEMON_VISIBLE": {
    title: i18n.t('tournament_status_pokemon_visible_title'),
    message: i18n.t('tournament_status_pokemon_visible_message')
  },
  "REGISTER_TEAM": {
    title: i18n.t('tournament_status_rosters_visible_title'),
    message: i18n.t('tournament_status_rosters_visible_message')
  },
  "MATCHUPS_VISIBLE": {
    title: i18n.t('tournament_status_rosters_visible_title'),
    message: i18n.t('tournament_status_rosters_visible_message')
  },
  "REGISTER_ROSTER": {
    title: i18n.t('tournament_status_round_not_started_title'),
    message: i18n.t('tournament_status_round_not_started_message')
  },
  "NOT_STARTED": {
    title: i18n.t('tournament_status_round_not_started_title'),
    message: i18n.t('tournament_status_round_not_started_message')
  },
}

const statusColors = {
  "POKEMON_VISIBLE": "success",
  "REGISTER_TEAM": "info",
  "MATCHUPS_VISIBLE": "info",
  "REGISTER_ROSTER": "error",
  "NOT_STARTED": "error",
}

export default function Tournament() {
  const { t } = useTranslation();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const router = useRouter();
  const { id } = router.query;
  const [ authId, setAuthId ] = useState();
  const [ isTournamentInfoOpen, setIsTournamentInfoOpen ] = useState(false);
  const [ profileToView, setProfileToView ] = useState(null);
  

  const getTournamentData = (newAuthId) => {
    setAuthId(newAuthId);
    setIsLoading(true);
    fetchApi(`session/get/?id=${id}`, "GET", {
      "x_session_id": newAuthId,
    })
    .then(response => response.json())
    .then(newData => {
      setData(newData);
      setIsLoading(false);
    });
  }

  const setTournamentState = (state) => {
    setIsLoading(true);
    fetchApi(`session/state/`, "POST", {
      "x_session_id": authId,
      "Content-Type": "application/json"
    }, JSON.stringify({
      tournamentId: id,
      newState: state,
    }))
    .then(() => getTournamentData(authId));
  }

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      getTournamentData(user?.uid ?? "");
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const onPlayer = (player) => {
    const thePlayer = data.players.find(p => player === p.name);
    setProfileToView(thePlayer);
  }

  const onClosePlayerModal = () => {
    setProfileToView(null);
  }

  const onCloseTournamentModal = () => {
    setIsTournamentInfoOpen(false);
  }

  const classes = useStyles();

  const renderAlert = () => {
    if (data == null || data.state == null) {
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
    const { isHost, isCaptain, isTeamTournament, isPlayer, state, bracketLink } = data;
    const buttons = [];
    if (bracketLink != null) {
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
    }
    if (isHost) {
      if (state === "POKEMON_VISIBLE") {
        const newState = isTeamTournament ? "MATCHUPS_VISIBLE" : "REGISTER_TEAM";
        buttons.push(
          <Button
            color="primary"
            className={classes.actionButtonMiddle}
            onClick={() => setTournamentState(newState)}
            key="HIDE_POKEMON">
            {t("tournament_hide_pokemon_button")}
          </Button>
        )
      }
      if (state !== "POKEMON_VISIBLE") {
        buttons.push(
          <Button
            color="primary"
            className={classes.actionButtonMiddle}
            onClick={() => setTournamentState("POKEMON_VISIBLE")}
            key="SHOW_POKEMON"
          >
           {t("tournament_show_pokemon_button")}
          </Button>
        )
      }
      if (state === "MATCHUPS_VISIBLE") {
        buttons.push(
          <Button
            color="primary"
            className={classes.actionButtonMiddle}
            onClick={() => setTournamentState("REGISTER_ROSTER")}
            key="HIDE_ROSTER">
            {t("tournament_hide_rosters_button")}
          </Button>
        )
      }
      if (state === "REGISTER_ROSTER" || (state === "NOT_STARTED" && isTeamTournament)) {
        buttons.push(
          <Button
            color="primary"
            className={classes.actionButtonMiddle}
            onClick={() => setTournamentState("MATCHUPS_VISIBLE")}
            key="SHOW_ROSTER"
          >
            {t("tournament_show_rosters_button")}
          </Button>
        )
      }
      // buttons.push(
      //   <Button color="secondary" key="EDIT_TM">
      //     {t("edit_tournament_information_button")}
      //   </Button>
      // );
    } else {
      if (isCaptain) {
        buttons.push(
          <Button color="primary" className={classes.actionButtonMiddle} key="EDIT_ROSTER">
            {t("team_manage_roster")}
          </Button>
        )
      }
      if (isPlayer) {
        const pokemonEditTitle = state !== "POKEMON_VISIBLE" ? t("tournament_edit_pokemon_button") : t("tournament_see_pokemon_button");
        buttons.push(
          <Button
            color="primary"
            className={classes.actionButtonMiddle}
            key="EDIT_POKEMON"
            href={`/team/${id}`}
          >
            {pokemonEditTitle}
          </Button>
        );
      }
      buttons.push(
        <Button
          color="secondary"
          key="SEE_TM"
          onClick={() => setIsTournamentInfoOpen(true)}
        >
          {t("tournament_view_information")}
        </Button>
      );
    }
    return buttons;
  }

  const renderRegistrationNumber = () => {
    if (data == null) {
      return null;
    }
    const { isHost, registrationNumber, isPlayer, state, isPrivate } = data;
    const hasTournamentStarted = state === "POKEMON_VISIBLE";
    const isParticipant = isHost || isPlayer;
    if (!isPrivate || !isParticipant || hasTournamentStarted || registrationNumber === '') {
      return null;
    }
    return (
      <Alert style={{ marginTop: 12 }} severity="info">
        {t("tournament_share_registration_number", { registrationNumber })}
      </Alert>
    );
  }

  if (isLoading) {
    return (<div>
      <Header
        absolute
        color="white"
        rightLinks={<HeaderLinks isSignedIn={isSignedIn} />}
      />
      <div className={classes.pageHeader}>
        <div className={classes.main}>
          <CircularProgress />
        </div>
      </div>
    </div>)
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
          <PlayerInfoModal open={profileToView != null} data={profileToView} onClose={onClosePlayerModal} />
          <TournamentInfoModal open={isTournamentInfoOpen} data={data} onClose={onCloseTournamentModal} />
          <GridContainer justify="center">
            <GridItem xs={12}>
              {renderAlert()}
              {renderRegistrationNumber()}
              <div className={classes.actions}>
                {renderActionButtons()}
              </div>
              {
                data?.isTeamTournament
                  ? (<FactionList
                      factions={data?.factions}
                      players={data?.players}
                      metaLogos={data?.metaLogos}
                      onPlayer={onPlayer}
                    />)
                  : (<SinglePlayerList players={data?.players} onPlayer={onPlayer}/>)
              }
            </GridItem>
          </GridContainer>
        </div>
      </div>
      <Footer />
    </div>
  );
}