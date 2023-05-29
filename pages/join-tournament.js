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

import styles from "/styles/jss/nextjs-material-kit/pages/createTournamentPage.js";
import { Button, Checkbox, Select, InputLabel, MenuItem } from "@mui/material";
import Card from "../components/Card/Card";
import fetchApi from "../api/fetchApi";

const useStyles = makeStyles(styles);

export default function JoinTournament() {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [step, setStep] = useState(0);
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm();
  const isCaptain = watch("isCaptain");

  const getPublicTournaments = (authId) => {
    setIsLoading(true);
    //TODO: API
    setIsLoading(false);
  }

  const onSubmit = (data) => {
    console.log(data);
    setStep(1);
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
              labelText="Tournament Number*"
              id="tournamentNumber"
              formControlProps={{
                fullWidth: true
              }}
              inputProps={{
                ...register("tournamentNumber", { required: true })
              }}
              error={errors.tournamentNumber}
            />
          </GridItem>
          <GridItem xs={12} md={6}>
            <CustomInput
              labelText="Registration Password (Leave blank if public)"
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
            This is a team tournament. Would you like to captain a new team?
            <Checkbox {...register("isCaptain")}/>
          </GridItem>
          {
            isCaptain ? (
              <GridItem xs={12}>
                <CustomInput
                  labelText="Team Name"
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
                  labelText="Team Code (Contact your captain if this is needed)"
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
          <h2>Join a Tournament</h2>
          <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
              <GridContainer style={{ paddingLeft: 20, paddingRight: 20 }}>
                <GridItem xs={12} style={{ marginBottom: 20 }}>
                  <h3>Join tournament by number</h3>
                </GridItem>
                {renderTournamentByLink()}
                <GridItem xs={12}>
                  <Button
                    type="submit"
                    disabled={isLoading || !isValid}
                    style={{ marginBottom: 10 }}
                  >
                    Join Tournament
                  </Button>
                  {
                    step !== 0 && (
                      <Button
                        onClick={onCancel}
                        color="error"
                        style={{ marginBottom: 10 }}
                      >
                        Cancel
                      </Button>
                    )
                  }
                </GridItem>
              </GridContainer>
            </form>
          </Card>
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
