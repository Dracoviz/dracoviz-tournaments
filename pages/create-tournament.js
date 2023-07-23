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
import { Button, Checkbox, Select, InputLabel, MenuItem } from "@mui/material";
import Card from "../components/Card/Card";
import fetchApi from "../api/fetchApi";

const useStyles = makeStyles(styles);

export default function CreateTournament() {
  const { t } = useTranslation();
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
        Router.push(`/tournament/${id}`);
      })
      .catch((err) => {
        alert(t(err));
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
        <InputLabel>{t("meta_slot_label", { index: hasMultipleMetas ? index+1 : "" })}</InputLabel>
        <Select
          fullWidth
          {...register(`metas.${index}`, { required: true, defaultValue: "Great League" })}
        >
          <MenuItem value="Great League">{t("great_league")}</MenuItem>
          <MenuItem value="Ultra League">{t("ultra_league")}</MenuItem>
          <MenuItem value="Master League">{t("master_league")}</MenuItem>
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
                <h2>{t("create_a_tournament")}</h2>
              </GridItem>
            </GridContainer>
            <Card>
              <GridContainer style={{ paddingLeft: 20, paddingRight: 20 }}>
                <GridItem xs={12}>
                  <h3>{t("tournament_details")}</h3>
                </GridItem>
                <GridItem xs={12} md={7}>
                  <CustomInput
                    labelText={t("tournament_name")}
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
                    labelText={t("tournament_description")}
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
                    labelText={t("create_server_invite_link")}
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
                    labelText={t("tournament_bracket_link")}
                    id="bracketLink"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      ...register("bracketLink"),
                    }}
                    error={errors.bracketLink}
                  />
                </GridItem>
                <GridItem xs={12} md={7}>
                {t("is_tournament_private")}
                  <Checkbox {...register("isPrivate")}/>
                </GridItem>
              </GridContainer>
            </Card>
            <Card style={{ paddingBottom: 30 }}>
              <GridContainer style={{ paddingLeft: 20, paddingRight: 20 }}>
                <GridItem xs={12}>
                  <h3>{t("tournament_game_settings")}</h3>
                </GridItem>
                <GridItem xs={12} md={7}>
                  <CustomInput
                    labelText={t("tournament_max_teams")}
                    id="maxTeams"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      type: "number",
                      ...register("maxTeams", { required: true, min: 3, max: 128 })
                    }}
                    error={errors.maxTeams}
                  />
                </GridItem>
                <GridItem xs={12} md={7}>
                {t("is_team_tournament")}
                  <Checkbox {...register("isTeamTournament")}/>
                </GridItem>
                {
                  isTeamTournament ? (
                    <>
                      <GridItem xs={12} md={6}>
                        <CustomInput
                          labelText={t("tournament_max_team_size")}
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
                          labelText={t("tournament_team_size_during_match")}
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
                {t("tournament_are_cps_required")}
                  <Checkbox {...register("isCPRequired")}/>
                </GridItem>
                {
                  isTeamTournament ? (
                    <GridItem xs={12} md={7}>
                      {t("tournament_multiple_metas_enabled")}
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
                  {t("create_tournament")}
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