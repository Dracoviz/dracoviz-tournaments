import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Router from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import { useForm } from "react-hook-form";
import i18n from "../i18n";
import { useTranslation } from 'react-i18next';

import styles from "/styles/jss/nextjs-material-kit/pages/createTournamentPage.js";
import { Button, Checkbox, Select, InputLabel, MenuItem, CircularProgress } from "@mui/material";
import Card from "../components/Card/Card";
import fetchApi from "../api/fetchApi";

const useStyles = makeStyles(styles);

export default function JoinTournament() {
  const { t } = useTranslation();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [authId, setAuthId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [step, setStep] = useState(0);
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm();
  const isCaptain = watch("isCaptain");

  const getPublicTournaments = (id) => {
    // setIsLoading(true);
    // //TODO: API
    setAuthId(id);
    // setIsLoading(false);
  }

  const onSubmit = (data) => {
    if (step === 0) {
      setIsLoading(true);
      fetchApi("/session/join", "POST", { "x_session_id": authId, "Content-Type": "application/json" }, JSON.stringify(data))
      .then((response) => response.json())
      .then((newData) => {
        const { isTeamTournament, id, error, alreadyEntered } = newData;
        setIsLoading(false);
        if (alreadyEntered) {
          Router.push(`/tournament/${id}`);
        }
        if (error != null) {
          alert(t(error));
          return;
        }
        if (isTeamTournament) {
          setStep(1);
        } else {
          Router.push(`/tournament/${id}`);
        }
      })
      .catch(() => {
        setIsLoading(false);
      })
    } else if (step === 1) {
      console.log("step 1");
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
        Router.push("/login");
      } else {
        getPublicTournaments(user.uid);
      }
    });
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
          {
            isCaptain ? (
              <GridItem xs={12}>
                <CustomInput
                  labelText={t("team_name")}
                  id="teamName"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    ...register("teamName")
                  }}
                  error={errors.teamName}
                />
              </GridItem>
            ) : (
              <GridItem xs={12}>
                <CustomInput
                  labelText={t("team_code")}
                  id="teamCode"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    ...register("teamCode")
                  }}
                  error={errors.teamCode}
                />
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <GridContainer style={{ paddingLeft: 20, paddingRight: 20 }}>
                <GridItem xs={12} style={{ marginBottom: 20 }}>
                  <h3>{t("join_tournament_by_number")}</h3>
                </GridItem>
                {renderTournamentByLink()}
                {
                  isLoading ? (
                    <CircularProgress />
                  ) : (
                    <GridItem xs={12}>
                      <Button
                        type="submit"
                        disabled={isLoading || !isValid}
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
          <small>{t("tournament_public_browsing_soon")}</small>
          {/* <GridContainer>
            <GridItem xs={12}>
              <h3>All tournaments</h3>
            </GridItem>
          </GridContainer> */}
        </div>
      </div>
      <Footer />
    </div>
  );
}