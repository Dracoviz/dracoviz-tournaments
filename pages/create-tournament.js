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

export default function CreateTournament() {
  const [authId, setAuthId] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    defaultValues: {
      maxTeamSize: 1,
      maxMatchTeamSize: 1,
    }
  });
  const hasMultipleMetas = watch("hasMultipleMetas");
  const maxMatchTeamSize = watch("maxMatchTeamSize");
  const isTeamTournament = watch("isTeamTournament");
  console.log(isTeamTournament);

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      if (!doesUserExist) {
        Router.push("/login");
        return;
      }
      setAuthId(user.uid);
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    fetchApi("session/create", "POST", { x_session_id: authId, "Content-Type": "application/json" }, JSON.stringify(data))
      .then(response => response.json())
      .then(newData => {
        const { id } = newData;
        Router.push(`/tournament?id=${id}`);
      })
      .catch((err) => {
        alert(err);
      });
    setIsLoading(false);
  }

  const renderMetas = useCallback(() => {
    const maxMatchTeamSizeNumber = parseInt(maxMatchTeamSize);
    let maxMatchTeamSlots = 1;
    if (maxMatchTeamSizeNumber > 10) {
      maxMatchTeamSlots = 10;
    } else if (maxMatchTeamSizeNumber > 0) {
      maxMatchTeamSlots = maxMatchTeamSizeNumber;
    }
    const slots = hasMultipleMetas ? maxMatchTeamSlots : 1;
    const metas = [...Array(slots).keys()];
    return metas.map((index) => (
      <GridItem xs={12} md={6} style={{ marginTop: 10 }} key={index} >
        <InputLabel>Meta {hasMultipleMetas ? index+1 : ""}</InputLabel>
        <Select
          fullWidth
          {...register(`metas.${index}`, { required: true, defaultValue: "Great League" })}
        >
          <MenuItem value="Great League">Great League</MenuItem>
          <MenuItem value="Ultra League">Ultra League</MenuItem>
          <MenuItem value="Master League">Master League</MenuItem>
        </Select>
      </GridItem>
    ))
  }, [hasMultipleMetas, maxMatchTeamSize]);

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
              </GridItem>
            </GridContainer>
            <Card>
              <GridContainer style={{ paddingLeft: 20, paddingRight: 20 }}>
                <GridItem xs={12}>
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
                      ...register("bracketLink"),
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
              </GridContainer>
            </Card>
            <Card style={{ paddingBottom: 30 }}>
              <GridContainer style={{ paddingLeft: 20, paddingRight: 20 }}>
                <GridItem xs={12}>
                  <h3>Game Settings</h3>
                </GridItem>
                <GridItem xs={12} md={7}>
                  <CustomInput
                    labelText="Max Teams (Max 128, Min 8)*"
                    id="maxTeams"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      type: "number",
                      ...register("maxTeams", { required: true, min: 8, max: 128 })
                    }}
                    error={errors.maxTeams}
                  />
                </GridItem>
                <GridItem xs={12} md={7}>
                  Is this a team tournament? 
                  <Checkbox {...register("isTeamTournament")}/>
                </GridItem>
                {
                  isTeamTournament ? (
                    <>
                      <GridItem xs={12} md={6}>
                        <CustomInput
                          labelText="Max Team Size (Including Alternates, Max 20)*"
                          id="maxTeamSize"
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps={{
                            type: "number",
                            ...register("maxTeamSize", { required: true, min: 1, max: 20 }),
                            defaultValue: 1,
                          }}
                          error={errors.maxTeamSize}
                        />
                      </GridItem>
                      <GridItem xs={12} md={6}>
                        <CustomInput
                          labelText="Team Size During Match (Max 10)*"
                          id="maxMatchTeamSize"
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps={{
                            type: "number",
                            ...register("maxMatchTeamSize", { required: true, min: 1, max: 10 }),
                            defaultValue: 1,
                          }}
                          error={errors.maxMatchTeamSize}
                        />
                      </GridItem>
                    </>
                  ) : null
                }
                <GridItem xs={12} md={7}>
                  Are Pokemon CPs required to be registered? 
                  <Checkbox {...register("isCPRequired")}/>
                </GridItem>
                {
                  isTeamTournament ? (
                    <GridItem xs={12} md={7}>
                      Do you want to enable multiple metas for this tournament? 
                      <Checkbox {...register("hasMultipleMetas")}/>
                    </GridItem>
                  ) : null
                }
                {renderMetas()}
              </GridContainer>
            </Card>
            <GridContainer>
              <GridItem xs={12}>
                <Button
                  type="submit"
                  disabled={isLoading || !isValid}
                  fullWidth
                  style={{ marginBottom: 10 }}
                >
                  Create Tournament
                </Button>
                <Button href="/"  color="error" fullWidth>Cancel</Button>
              </GridItem>
            </GridContainer>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}