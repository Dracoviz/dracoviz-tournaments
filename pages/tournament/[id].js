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
  const formProps = useForm();
  const { setValue, formState: { isSubmitting } } = formProps;
  const router = useRouter();
  const { id } = router.query;
  const [ authId, setAuthId ] = useState();
  const [ isTournamentInfoOpen, setIsTournamentInfoOpen ] = useState(false);
  const [ isTournamentEditOpen, setIsTournamentEditOpen ] = useState(false);
  const [ isTeamSheetOpen, setIsTeamSheetOpen ] = useState(false);
  const [ profileToView, setProfileToView ] = useState(null);
  const [ selectedRound, setSelectedRound ] = useState(null);
  const [ isReportScoreOpen, setIsReportScoreOpen ] = useState(false);
  const isConcluded = data?.concluded;

  const statusLabels = {
    "POKEMON_VISIBLE": {
      title: t('tournament_status_pokemon_visible_title'),
      message: t('tournament_status_pokemon_visible_message')
    },
    "REGISTER_TEAM": {
      title: t('tournament_status_rosters_visible_title'),
      message: t('tournament_status_rosters_visible_message')
    },
    "MATCHUPS_VISIBLE": {
      title: t('tournament_status_rosters_visible_title'),
      message: t('tournament_status_rosters_visible_message')
    },
    "REGISTER_ROSTER": {
      title: t('tournament_status_round_not_started_title'),
      message: t('tournament_status_round_not_started_message')
    },
    "NOT_STARTED": {
      title: t('tournament_status_round_not_started_title'),
      message: t('tournament_status_round_not_started_message')
    },
  }

  const showValid = data?.isHost && !data?.registrationClosed;

  const goToRoute = (route) => {
    router.push(route);
  }

  const startBracket = () => {
    setIsLoading(true);
    fetchApi(`session/bracket-start/`, "POST", {
      "x_session_id": authId,
      "Content-Type": "application/json"
    }, JSON.stringify({
      tournamentId: id,
    }))
    .then(response => response.json())
    .then((newData) => {
      if (newData.error != null) {
        alert(t(newData.error));
        setIsLoading(false);
      } else {
        getTournamentData(authId);
      }
    });
  }

  const revertBracket = () => {
    setIsLoading(true);
    fetchApi(`session/revert/`, "POST", {
      "x_session_id": authId,
      "Content-Type": "application/json"
    }, JSON.stringify({
      tournamentId: id,
    }))
    .then(response => response.json())
    .then((newData) => {
      if (newData.error != null) {
        alert(t(newData.error));
        setIsLoading(false);
      } else {
        getTournamentData(authId);
      }
    });
  }

  const progressBracket = () => {
    if (confirm(t('confirm_bracket_progress'))) {
      setIsLoading(true);
      fetchApi(`session/progress/`, "POST", {
        "x_session_id": authId,
        "Content-Type": "application/json"
      }, JSON.stringify({
        tournamentId: id,
      }))
      .then(response => response.json())
      .then((newData) => {
        if (newData.error != null) {
          alert(t(newData.error));
          setIsLoading(false);
        } else {
          getTournamentData(authId);
        }
      });
    }
  }

  const getTournamentData = (newAuthId) => {
    setAuthId(newAuthId);
    setIsLoading(true);
    fetchApi(`session/get/?id=${id}`, "GET", {
      "x_session_id": newAuthId,
      x_locale: router.locale,
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
    .then(response => response.json())
    .then((newData) => {
      if (newData.error != null) {
        alert(t(newData.error));
      } else {
        getTournamentData(authId);
      }
    });
  }

  const onConclude = () => {
    setIsLoading(true);
    fetchApi(`session/conclude/`, "POST", {
      "x_session_id": authId,
      "Content-Type": "application/json"
    }, JSON.stringify({
      tournamentId: id,
    }))
    .then(response => response.json())
    .then((newData) => {
      if (newData.error != null) {
        alert(t(newData.error));
      } else {
        setIsTournamentEditOpen(false);
        getTournamentData(authId);
      }
    });
  }

  const deletePlayer = async (playerName) => {
    setIsLoading(true);
    const response = await fetchApi(`session/leave/`, "POST", {
      "x_session_id": authId,
      "Content-Type": "application/json"
    }, JSON.stringify({
      tournamentId: id,
      playerName,
    }));
    const newData = await response.json();
    if (newData.error != null) {
      alert(t(newData.error));
      setIsLoading(false);
      return false;
    }
    return true;
  }

  const deleteTournament = async () => {
    setIsLoading(true);
    const response = await fetchApi(`session/delete/`, "POST", {
      "x_session_id": authId,
      "Content-Type": "application/json"
    }, JSON.stringify({
      tournamentId: id,
    }));
    const newData = await response.json();
    if (newData.error != null) {
      alert(t(newData.error));
      setIsLoading(false);
      return false;
    }
    return true;
  }

  const onEditTournament = async (data) => {
    const response = await fetchApi(`session/edit/`, "POST", {
      "x_session_id": authId,
      "Content-Type": "application/json"
    }, JSON.stringify({
      ...data,
      tournamentId: id,
    }));
    const newData = await response.json();
    if (newData.error != null) {
      alert(t(newData.error));
    } else {
      setIsTournamentEditOpen(false);
      getTournamentData(authId);
    }
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

  const onDeletePlayer = (player) => {
    deletePlayer(player).then((didSucceed) => {
      if (didSucceed) {
        getTournamentData(authId);
      } else {
        setIsLoading(false);
      }
    });
  }

  const onLeave = async () => {
    const didDelete = await deletePlayer(null);
    if (didDelete) {
      Router.push("/");
    }
  }

  const onDelete = () => {
    if (confirm(t("delete_tournament_disclaimer"))) {
      deleteTournament().then((didSucceed) => {
        if (didSucceed) {
          Router.push("/");
        } else {
          setIsLoading(false);
        }
      });
    }
  }

  const onCloseTeamSheet = () => {
    setIsTeamSheetOpen(false);
  }

  const onClosePlayerModal = () => {
    setProfileToView(null);
  }

  const onCloseTournamentModal = () => {
    setIsTournamentInfoOpen(false);
  }

  const onCloseTournamentEditModal = () => {
    setIsTournamentEditOpen(false);
  }

  const onCloseReportScoreModal = () => {
    if (isSubmitting) {
      return;
    }
    setIsReportScoreOpen(false);
    setSelectedRound(null);
  }

  const exportData = () => {
    if (data == null || data.state !== "POKEMON_VISIBLE") {
      return null
    }
    const { players } = data;
    const exportedData = players?.map(p => {
      const { wins, losses, gameWins, gameLosses, name, pokemon } = p;
      return {
        wins,
        losses,
        gameWins,
        gameLosses,
        name,
        pokemon,
      }
    })
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(exportedData)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "data.json";

    link.click();
  };

  const reportScore = async (scores) => {
    const { player1, player2 } = scores;
    const { matchIndex, roundIndex } = selectedRound;
    const response = await fetchApi(`session/report/`, "POST", {
      "x_session_id": authId,
      "Content-Type": "application/json"
    }, JSON.stringify({
      tournamentId: id,
      player1,
      player2,
      matchIndex,
      scoreIndex: 0, // TODO: Teams
      targetRoundIndex: roundIndex,
    }));
    const newData = await response.json();
    if (newData.error != null) {
      alert(t(newData.error));
    } else {
      setIsReportScoreOpen(false);
      getTournamentData(authId);
    }
  }

  const onBracketSelect = (roundIndex, matchIndex) => {
    const bracket = data?.bracket[roundIndex]?.matches[matchIndex];
    if (bracket == null
      || data?.isHost !== true
      || isConcluded
    ) {
      return;
    }
    setValue("player1", bracket.score[0][0]);
    setValue("player2", bracket.score[0][1]);
    setSelectedRound({
      roundIndex,
      matchIndex,
      score: bracket.score[0],
      player1: bracket.participants[0][0].name,
      player2: bracket.participants[0][1].name,
      gameAmount: data?.gameAmount,
      playAllMatches: data?.playAllMatches,
    });
  }

  useEffect(() => {
    if (selectedRound != null) {
      setIsReportScoreOpen(true);
    }
  }, [selectedRound])

  const generateJoinLink = () => {
    const { registrationNumber } = data;
    const isRegistrationNumberEmpty = registrationNumber == null || registrationNumber.trim() === "";
    const registrationParam = `&pid=${registrationNumber}`;
    const baseUrl = window.location.protocol + "//" + location.host;
    const theUrl = `${baseUrl}/join-tournament?tid=${id}${isRegistrationNumberEmpty ? "" : registrationParam}`;
    return theUrl;
  }

  const generateShareLink = () => {
    const baseUrl = window.location.protocol + "//" + location.host;
    const theUrl = `${baseUrl}/tournament/${id}`;
    return theUrl;
  } 

  const shareTournament = async () => {
    const shareLink = generateShareLink();
    await navigator.clipboard.writeText(shareLink);
    alert(t("copy_to_clipboard", { url: shareLink }));
  }

  const shareTeam = async () => {
    const { teamCode } = data;
    const shareLink = `${generateJoinLink()}&faction=${teamCode}`;
    await navigator.clipboard.writeText(shareLink);
    alert(t("copy_to_clipboard", { url: shareLink }));
  }

  const classes = useStyles();

  const renderTeamSheetButton = () => {
    if (data == null || data.isHost !== true) {
      return null;
    }
    return (
      <Button onClick={() => setIsTeamSheetOpen(true)} variant="contained" color="success">
        {t("create_team_sheets")}
      </Button>
    )
  }

  const renderExportButton = () => {
    if (data == null || (data.state !== "POKEMON_VISIBLE" && !data.isHost)) {
      return null
    }
    return (
      <Button onClick={exportData} style={{ float: "right" }}>
        {t("export_team_data")}
      </Button>
    )
  }

  const renderConcludeStatus = () => {
    if (data == null || !isConcluded) {
      return null;
    }
    return (
      <Alert severity="info" color="info">
        <AlertTitle>{t("concluded_tournament")}</AlertTitle>
        {t("concluded_tournament_message")}
      </Alert>
    )
  }

  const renderRegistrationStatus = () => {
    if (data == null || data.state == null || isConcluded) {
      return null;
    }
    const { registrationClosed } = data;
    return (
      <Alert severity="info" color={registrationClosed ? "warning" : "success"}>
        <AlertTitle>{registrationClosed ? t("registration_closed") : t("registration_open")}</AlertTitle>
      </Alert>
    )
  }

  const renderAlert = () => {
    if (data == null || data.state == null || isConcluded) {
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

  const renderCountdown = () => {
    if (
      data == null
      || isConcluded
      || data.roundEndTime == null
      || data.currentRoundNumber <= 0
      || data.timeControl == null
      || data.timeControl <= 0
    ) {
      return null;
    }
    return (
      <Countdown endDate={new Date(data.roundEndTime)} />
    )
  }

  const renderShareButtons = () => {
    if (data == null || isConcluded) {
      return null;
    }
    const { isHost, isPlayer, isTeamTournament, state, teamCode, registrationClosed } = data;
    const buttons = [];
    if (!isHost && !isPlayer) {
      if (registrationClosed) {
        return null;
      }
      return (
        <div className={classes.actions}>
          <Button
            onClick={() => goToRoute(generateJoinLink())}
            className={classes.actionButtonMiddle}
            variant="contained"
            color="primary"
            key="JOIN_TOURNAMENT"
          >
            {t("join_tournament")}
          </Button>
        </div>
      );
    }
    buttons.push(
      <Button
        onClick={shareTournament}
        className={classes.actionButtonMiddle}
        variant="contained"
        color="info"
        key="SHARE_TOURNAMENT"
      >
        {t("tournament_share_button")}
      </Button>
    );
    if (isTeamTournament && !registrationClosed && teamCode != null && teamCode !== "") {
      buttons.push(
        <Button
          onClick={shareTeam}
          className={classes.actionButtonMiddle}
          variant="contained"
          color="success"
          key="SHARE_TEAM"
        >
          {t("tournament_team_share_button")}
        </Button>
      );
    }
    return <div className={classes.actions}>{buttons}</div>
  }

  const renderActionButtons = () => {
    if (data == null) {
      return null;
    }
    const seeTmButton = (
      <Button
        color="secondary"
        key="SEE_TM"
        style={{ marginBottom: 10 }}
        onClick={() => setIsTournamentInfoOpen(true)}
      >
        {t("tournament_view_information")}
      </Button>
    );
    const { isHost, isCaptain, isTeamTournament, isPlayer, state, bracketLink } = data;
    if (isConcluded) {
      return [seeTmButton];
    }
    const buttons = [];
    if (bracketLink != null && bracketLink !== "") {
      buttons.push(
        <Button
          href={bracketLink}
          target="_blank"
          rel="noreferrer"
          variant="outlined"
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
      buttons.push(
        <Button
          color="secondary"
          key="EDIT_TM"
          style={{ marginBottom: 10 }}
          onClick={() => setIsTournamentEditOpen(true)}
        >
          {t("edit_tournament_information_button")}
        </Button>
      );
    } else {
      if (isCaptain) {
        buttons.push(
          <Button
            color="primary"
            className={classes.actionButtonMiddle}
            key="EDIT_ROSTER"
            onClick={() => goToRoute(`/captain/${id}`)}
          >
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
            onClick={() => goToRoute(`/team/${id}`)}
          >
            {pokemonEditTitle}
          </Button>
        );
      }
      buttons.push(seeTmButton);
    }
    return buttons;
  }

  const renderRegistrationNumber = () => {
    if (data == null || isConcluded) {
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

  const renderTeamNumber = () => {
    if (data == null || isConcluded) {
      return null;
    }
    const { isTeamTournament, state, teamCode } = data;
    const hasTournamentStarted = state === "POKEMON_VISIBLE";
    if (!isTeamTournament || hasTournamentStarted || teamCode == null || teamCode === "") {
      return null;
    }
    return (
      <Alert style={{ marginTop: 12 }}>
        {t("tournament_share_team_number", { teamCode })}
      </Alert>
    );
  }

  const renderBracketDisclaimer = () => {
    if (data == null || isConcluded || !(data?.currentRoundNumber > 0)) {
      return null;
    }
    const { requireBothPlayersToReport } = data;
    return (
      <small>
        {requireBothPlayersToReport ? t("both_players_disclaimer_true") : t("both_players_disclaimer_false")}
      </small>
    )
  }

  const renderBracketActions = () => {
    if (data == null || isConcluded) {
      return null;
    }
    const { isPlayer, isHost, bracketType, currentRoundNumber, totalRounds, players } = data;
    if (players?.length < 2) {
      return null;
    }
    if (isHost && !(bracketType == null || bracketType === "none")) {
      if (totalRounds === currentRoundNumber) {
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={onConclude}
            fullWidth
            style={{ marginTop: 20, marginBottom: 20 }}
          >
            {t("conclude_tournament")}
          </Button>
        )
      }
      if (currentRoundNumber === 0) {
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={startBracket}
            fullWidth
            style={{ marginTop: 20, marginBottom: 20 }}
          >
            {t("start_bracket")}
          </Button>
        )
      }
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={progressBracket}
          fullWidth
          style={{ marginTop: 20, marginBottom: 20 }}
        >
          {t("progress_bracket")}
        </Button>
      )
    }
    if (!isPlayer || !(currentRoundNumber > 0)) {
      return null;
    }
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() => goToRoute(`/matchup/${id}`)}
        fullWidth
        style={{ marginTop: 20, marginBottom: 20 }}
      >
        {t("view_matchup")}
      </Button>
    )
  }

  const renderChips = () => {
    if (data == null) {
      return null;
    }
    const { bracketType, timeControl } = data;
    const bracketLabels = {
      "none": "bracket_type_none",
	    "swiss": "bracket_type_swiss",
	    "roundrobin": "bracket_type_round_robin"
    }
    const roundLabels = getRoundLengthLabel(t);
    return (
      <div style={{ marginBottom: 20 }}>
        <Chip label={t(bracketLabels[bracketType ?? "none"])} style={{ marginRight: 10 }} />
        <Chip label={`${t("round_length")}: ${roundLabels[timeControl ?? 0]}`} color="info" />
      </div>
    )
  }

  const renderLeaveButton = () => {
    if (data == null || isConcluded) {
      return null;
    }
    const { isTeamTournament, isHost, isPlayer } = data;
    if (isTeamTournament || isHost || !isPlayer) {
      return null;
    }
    return (
      <Button
        color="error"
        onClick={onLeave}
      >
        {t("leave_session")}
      </Button>
    );
  }

  const renderDeleteButton = () => {
    if (data == null || isConcluded) {
      return null;
    }
    const { isHost } = data;
    if (!isHost) {
      return null;
    }
    return (
      <Button
        color="error"
        onClick={onDelete}
      >
        {t("delete_tournament")}
      </Button>
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
          <ReportScoreModal
            data={selectedRound}
            visible={isReportScoreOpen}
            onSubmit={reportScore}
            onClose={onCloseReportScoreModal}
            formProps={formProps}
            useNames={true}
          />
          <TournamentInfoModal
            open={isTournamentInfoOpen}
            data={data}
            onClose={onCloseTournamentModal}
          />
          <EditTournamentModal
            open={isTournamentEditOpen}
            data={data}
            onClose={onCloseTournamentEditModal}
            onSave={onEditTournament}
            onConclude={onConclude}
          />
          <TeamSheetModal
            open={isTeamSheetOpen}
            data={data}
            onClose={onCloseTeamSheet}
          />
          <GridContainer justify="center">
            <GridItem xs={12}>
              {renderTeamSheetButton()}
              {renderExportButton()}
              <h1 style={{ marginTop: 10, wordBreak: "break-word" }}>{data?.name}</h1>
              {renderChips()}
              <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                <a href={decoratedHref} target="_blank" rel="noreferrer" key={key}>{decoratedText}</a>
              )} >
                <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{data?.description}</p>
              </Linkify>
              <p style={{ marginBottom: 20 }}>
                <b>{data?.hideTeamsFromHost ? t("host_cannot_see_teams") : t("host_can_see_teams")}</b>
              </p>
              {renderConcludeStatus()}
              {renderRegistrationStatus()}
              {renderAlert()}
              {renderRegistrationNumber()}
              {/* {renderTeamNumber()} */}
              <div className={classes.actions}>
                {renderActionButtons()}
              </div>
              {renderShareButtons()}
              {renderCountdown()}
              {renderBracketActions()}
              {renderBracketDisclaimer()}
              <Brackets
                bracket={data?.bracket}
                onBracketSelect={onBracketSelect}
                isTeamTournament={data?.isTeamTournament}
                currentRoundNumber={data?.currentRoundNumber}
                totalRounds={data?.totalRounds}
              />
              {
                data?.isTeamTournament
                  ? (<FactionList
                      factions={data?.factions}
                      players={data?.players}
                      metaLogos={data?.metaLogos}
                      onPlayer={onPlayer}
                      onDeletePlayer={onDeletePlayer}
                      isHost={data?.isHost}
                      showValid={showValid}
                    />)
                  : (<SinglePlayerList
                      players={data?.players}
                      onPlayer={onPlayer}
                      onDeletePlayer={onDeletePlayer}
                      isHost={data?.isHost}
                      showValid={showValid}
                    />)
              }
              {renderLeaveButton()}
              {renderDeleteButton()}
            </GridItem>
          </GridContainer>
        </div>
      </div>
      <Footer />
    </div>
  );
}