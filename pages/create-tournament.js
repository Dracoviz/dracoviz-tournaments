import React, { useEffect, useState } from "react";
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
import { Button, Checkbox } from "@mui/material";

const useStyles = makeStyles(styles);

export default function CreateTournament() {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const { register, handleSubmit, getValues, formState: { errors, isDirty, isValid } } = useForm();

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

  const onSubmit = (data) => {
    console.log(data);
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <GridContainer>
              <GridItem xs={12}>
                <h2>Create a tournament</h2>
                <h3>Tournament Details</h3>
              </GridItem>
              <GridItem xs={12} md={7}>
                <CustomInput
                  labelText="Tournament Name*"
                  id="name"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    ...register("name", { required: true })
                  }}
                  error={errors.name}
                />
              </GridItem>
              <GridItem xs={12} md={7}>
                <CustomInput
                  labelText="Tournament Description*"
                  id="description"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    multiline: true,
                    ...register("description", { required: true, maxLength: 300 })
                  }}
                  error={errors.description}
                />
              </GridItem>
              <GridItem xs={12} md={7}>
                <CustomInput
                  labelText="Server Invite Link (Discord, Telegram, etc)"
                  id="serverInviteLink"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    ...register("serverInviteLink")
                  }}
                  error={errors.serverInviteLink}
                />
              </GridItem>
              <GridItem xs={12} md={7}>
                <CustomInput
                  labelText="Bracket Link"
                  id="bracketLink"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    ...register("bracketLink")
                  }}
                  error={errors.bracketLink}
                />
                <p>
                  <small>
                    Note: We are working on hosting our own brackets.
                    For now, please include a link to your tournament bracket from
                    {" "}
                    <a href="https://challonge.com/" target="_blank">Challonge</a>,
                    {" "}
                    <a href="https://matcherino.com/" target="_blank">Matcherino</a>,
                    or another bracket builder.
                  </small>
                </p>
              </GridItem>
              <GridItem xs={12} md={7}>
                Is this a private tournament? 
                <Checkbox {...register("isPrivate")}/>
              </GridItem>
              <GridItem xs={12}>
                <h3>Game Settings</h3>
              </GridItem>
              <GridItem xs={12} md={7}>
                Are Pokemon CPs required to be registered? 
                <Checkbox {...register("isCPRequired")}/>
              </GridItem>
              <GridItem xs={12} md={7}>
                <CustomInput
                  labelText="Max Teams*"
                  id="maxTeams"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    type: "number",
                    ...register("maxTeams", { required: true })
                  }}
                  error={errors.maxTeams}
                />
              </GridItem>
              <GridItem xs={12} md={6}>
                <CustomInput
                  labelText="Max Team Size (Including Alternates)*"
                  id="maxTeamSize"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    type: "number",
                    ...register("maxTeamSize", { required: true })
                  }}
                  error={errors.maxTeamSize}
                />
              </GridItem>
              <GridItem xs={12} md={6}>
                <CustomInput
                  labelText="Team Size During Match*"
                  id="maxMatchTeamSize"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    type: "number",
                    ...register("maxMatchTeamSize", { required: true })
                  }}
                  error={errors.maxMatchTeamSize}
                />
              </GridItem>
              <GridItem xs={12} md={7}>
                Do you want to enable multiple metas for this tournament? 
                <Checkbox {...register("hasMultipleMetas")}/>
              </GridItem>
              <GridItem xs={12}>
                <Button type="submit" fullWidth>Create Tournament</Button>
              </GridItem>
            </GridContainer>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}