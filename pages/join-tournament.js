import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Router, { useRouter } from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import TournamentsList from "../pages-sections/tournament-sections/TournamentsList";
import { useForm } from "react-hook-form";
import { useTranslation } from 'next-i18next';

import styles from "/styles/jss/nextjs-material-kit/pages/createTournamentPage.js";
import { Button, Checkbox, CircularProgress } from "@mui/material";
import Card from "../components/Card/Card";
import fetchApi from "../api/fetchApi";
import { track } from "../utils/analytics";
import { EVENT, PARAM, RESULT, SCREEN, SOURCE } from "../utils/analyticsEvents";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

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

export default function JoinTournament() {
  const { t } = useTranslation();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [authId, setAuthId] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [step, setStep] = useState(0);
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm();
  const isCaptain = watch("isCaptain");
  const router = useRouter();
  const { tid, pid, faction } = router.query;

  const getPublicTournaments = (id) => {
    setIsLoading(true);
    setAuthId(id);
    fetchApi("session/all/", "GET", { "x_session_id": id })
      .then((response) => response.json())
      .then((data) => {
        setTournaments(data?.filteredSessions ?? []);
        setIsLoading(false);
      });
  }

  const onSubmit = (allData, source = SOURCE.MANUAL) => {
    const { firebaseId, ...data } = allData;
    const theId = firebaseId ?? authId;
    if (step === 0) {
      setIsFormLoading(true);
      track(EVENT.JOIN_SUBMITTED, {
        [PARAM.SOURCE]: source,
        [PARAM.CONFIG_FLAGS]: data?.registrationNumber ? "has_reg_number" : "",
      });
      fetchApi("session/join/", "POST", { "x_session_id": theId, "Content-Type": "application/json" }, JSON.stringify(data))
      .then((response) => response.json())
      .then((newData) => {
        const { isTeamTournament, id, error, alreadyEntered } = newData;
        setIsFormLoading(false);
        if (alreadyEntered) {
          track(EVENT.ALREADY_ENTERED, {
            [PARAM.SOURCE]: source,
            [PARAM.TOURNAMENT_ID]: id,
          });
          Router.push(`/tournament/${id}`);
        } else if (error != null) {
          track(EVENT.JOIN_FAILED, {
            [PARAM.SOURCE]: source,
            [PARAM.ERROR_CODE]: error,
            [PARAM.RESULT]: RESULT.FAILURE,
          });
          alert(t(error));
          return;
        }
        // NOTE: the `alreadyEntered` branch above deliberately falls through to
        // here (pre-existing behaviour), so guard it or a re-visit would be
        // counted as a fresh join and inflate the funnel.
        if (!alreadyEntered) {
          track(EVENT.JOINED_TOURNAMENT, {
            [PARAM.SOURCE]: source,
            [PARAM.TOURNAMENT_ID]: id,
            [PARAM.IS_TEAM_TOURNAMENT]: isTeamTournament === true,
            [PARAM.RESULT]: RESULT.SUCCESS,
          });
        }
        if (isTeamTournament) {
          setStep(1);
        } else {
          Router.push(`/tournament/${id}`);
        }
      })
      .catch(() => {
        track(EVENT.JOIN_FAILED, {
          [PARAM.SOURCE]: source,
          [PARAM.ERROR_CODE]: "network_error",
          [PARAM.RESULT]: RESULT.FAILURE,
        });
        setIsFormLoading(false);
      })
    } else if (step === 1) {
      const { isCaptain, factionCode, factionName, tournamentId } = data;
      setIsFormLoading(true);
      // create faction endpoint
      if (isCaptain) {
        fetchApi(
          "faction/create/",
          "POST",
          { "x_session_id": authId, "Content-Type": "application/json" },
          JSON.stringify({ factionName, tournamentId })
        )
        .then((response) => response.json())
        .then((newData) => {
          const { factionCode, tournamentId, factionName, error } = newData;
          setIsFormLoading(false);
          if (error != null) {
            track(EVENT.FACTION_CREATED, {
              [PARAM.ERROR_CODE]: error,
              [PARAM.RESULT]: RESULT.FAILURE,
            });
            alert(t(error));
            return;
          }
          track(EVENT.FACTION_CREATED, {
            [PARAM.TOURNAMENT_ID]: tournamentId,
            [PARAM.RESULT]: RESULT.SUCCESS,
          });
          alert(t("faction_joined", { factionName }) + " " + t("faction_created", { factionCode }));
          Router.push(`/tournament/${tournamentId}`);
        });
      } else { // join faction endpoint
        fetchApi(
          "faction/join/",
          "POST",
          { "x_session_id": authId, "Content-Type": "application/json" },
          JSON.stringify({ factionName, tournamentId, factionCode })
        )
        .then((response) => response.json())
        .then((newData) => {
          const { tournamentId, factionName, error } = newData;
          setIsFormLoading(false);
          if (error != null) {
            track(EVENT.FACTION_JOINED, {
              [PARAM.ERROR_CODE]: error,
              [PARAM.RESULT]: RESULT.FAILURE,
            });
            alert(t(error));
            return;
          }
          track(EVENT.FACTION_JOINED, {
            [PARAM.TOURNAMENT_ID]: tournamentId,
            [PARAM.RESULT]: RESULT.SUCCESS,
          });
          alert(t("faction_joined", { factionName }));
          Router.push(`/tournament/${tournamentId}`);
        });
      }
      // console.log(data);
    }
  }

  const onCancel = () => {
    setStep(0);
  }

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      if (!doesUserExist) {
        track(EVENT.AUTH_GATE_REDIRECT, { [PARAM.SCREEN]: SCREEN.JOIN_TOURNAMENT });
        Router.push(`/login?returnUrl=${router.asPath}`);
      } else {
        if (tid != null && tid !== "") {
          const autoData = { tournamentId: tid, registrationNumber: "", firebaseId: user.uid }
          setValue("tournamentId", tid);
          if (pid != null) {
            autoData.registrationNumber = pid;
            setValue("registrationNumber", tid);
          }
          setAuthId(user.uid)
          onSubmit(autoData, SOURCE.DEEP_LINK);
        } else {
          getPublicTournaments(user.uid);
        }
      }
    });

    if (faction != null) {
      setValue("factionCode", faction);
    }

    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const classes = useStyles();

  const renderTournamentByLink = () => {
    if (step === 0) {
      return (
        <>
          <GridItem xs={12} md={6}>
            <CustomInput
              labelText={t("tournament_number")}
              id="tournamentId"
              formControlProps={{
                fullWidth: true
              }}
              inputProps={{
                ...register("tournamentId", { required: true })
              }}
              error={errors.tournamentId}
            />
          </GridItem>
          <GridItem xs={12} md={6}>
            <CustomInput
              labelText={t("tournament_registration_password")}
              id="registrationNumber"
              formControlProps={{
                fullWidth: true
              }}
              inputProps={{
                ...register("registrationNumber")
              }}
              error={errors.registrationNumber}
            />
          </GridItem>
        </>
      );
    }
    return (
      <>
         <GridItem xs={12}>
         {t("team_tournament_captain")}
            <Checkbox {...register("isCaptain")}/>
          </GridItem>
            { !isCaptain ? (
              <GridItem xs={12}>
                <CustomInput
                  labelText={t("team_code")}
                  id="factionCode"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    ...register("factionCode", { required: !isCaptain }),
                  }}
                  error={errors.teamCode}
                />
              </GridItem>
            ) : (
              <GridItem xs={12}>
                <CustomInput
                  labelText={t("team_name")}
                  id="factionName"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    ...register("factionName", { required: isCaptain })
                  }}
                  error={errors.teamName}
                />
                <small>{t("faction_censor_disclaimer")}</small>
              </GridItem>
            )
          }
      </>
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
          <h2>{t("join_a_tournament")}</h2>
          <Card>
            <form onSubmit={handleSubmit((formData) => onSubmit(formData))}>
              <GridContainer style={{ paddingLeft: 20, paddingRight: 20 }}>
                <GridItem xs={12} style={{ marginBottom: 20 }}>
                  <h3>{t("join_tournament_by_number")}</h3>
                </GridItem>
                {renderTournamentByLink()}
                {
                  isFormLoading ? (
                    <CircularProgress />
                  ) : (
                    <GridItem xs={12}>
                      <Button
                        type="submit"
                        disabled={isFormLoading || !isValid}
                        style={{ marginBottom: 10 }}
                      >
                        {t("join_tournament")}
                      </Button>
                      {
                        step !== 0 && (
                          <Button
                            onClick={onCancel}
                            color="error"
                            style={{ marginBottom: 10 }}
                          >
                            {t("cancel")}
                          </Button>
                        )
                      }
                    </GridItem>
                  )
                }
              </GridContainer>
            </form>
          </Card>
          {
            isLoading ? (
              <CircularProgress />
            ) : (
              <GridContainer>
                <GridItem xs={12}>
                  <h3>All tournaments</h3>
                  <TournamentsList tournaments={tournaments}/>
                </GridItem>
              </GridContainer>
            )
          }
        </div>
      </div>
      <Footer />
    </div>
  );
}
