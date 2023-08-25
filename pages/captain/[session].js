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
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import styles from "/styles/jss/nextjs-material-kit/pages/createTournamentPage.js";
import { Button, Select, InputLabel, MenuItem, CircularProgress } from "@mui/material";
import fetchApi from "../../api/fetchApi";

const useStyles = makeStyles(styles);

export default function Team() {
  const { t } = useTranslation();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const { register, setValue, handleSubmit, watch, formState: { errors, isValid } } = useForm();
  const [metaOptions, setMetaOptions] = useState([]);
  const [playerOptions, setPlayerOptions] = useState([]);
  const router = useRouter();
  const [authId, setAuthId] = useState();
  const { session } = router.query;

  const getFactionData = (id) => {
    setAuthId(id);
    setIsLoading(true);
    fetchApi(`faction/get/?tournamentId=${session}`, "GET", {
      x_session_id: id,
    })
    .then(response => response.json())
    .then(data => {
      if (data.error != null) {
        alert(t(data.error));
        Router.push(`/tournament/${session}`);
        return;
      }
      const { metas, players, factionName, description, canEdit } = data;
      players.forEach((p) => {
        if (p.tournamentPosition > (-1)) {
          setValue(`slot.${p.tournamentPosition}`, p.session);
        }
      });
      setValue("factionName", factionName);
      setValue("description", description);
      setMetaOptions(metas);
      setPlayerOptions(players);
      setCanEdit(canEdit);
      setIsLoading(false);
    });
  }

  const onSubmit = (data) => {
    setSubmitting(true);
    fetchApi(`faction/edit/`, "POST",
      {
        x_session_id: authId, "Content-Type": "application/json"
      }, JSON.stringify({ ...data, tournamentId: session })
    )
    .then(response => response.json())
    .then(data => {
      if (data.error != null) {
        alert(t(data.error));
      } else {
        alert(t("saved"));
        Router.push(`/tournament/${session}`);
      }
      setSubmitting(false);
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
        getFactionData(user.uid);
      }
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const renderForm = () => {
    if (isLoading) {
      return (<CircularProgress />);
    }
    return (
      <>
        <GridItem xs={12}>
          <CustomInput
            labelText={t("edit_faction_team_name")}
            id="factionTeamName"
            formControlProps={{
              fullWidth: true
            }}
            inputProps={{
              ...register("factionName", { required: true })
            }}
            error={errors.factionName}
          />
        </GridItem>
        <GridItem xs={12}>
          <CustomInput
            labelText={t("edit_faction_team_description")}
            id="factionDescription"
            formControlProps={{
              fullWidth: true
            }}
            inputProps={{
              ...register("description")
            }}
            error={errors.description}
          />
        </GridItem>
        <GridItem xs={12}>
          <div style={{ height: 30 }} />
        </GridItem>
        {
          metaOptions.map((meta, index) => (
            <GridItem xs={12} md={6}>
              <InputLabel>{t('edit_faction_team_slot', { index: index + 1 })} ({meta})</InputLabel>
              <Select
                fullWidth
                {...register(`slot.${index}`, { required: true })}
                value={watch(`slot.${index}`)}
                variant="standard"
                style={{ marginBottom: 5 }}
              >
                {playerOptions.map((op) => (
                  <MenuItem value={op.session} key={op.name}>{op.name}</MenuItem>
                ))}
              </Select>
            </GridItem>
          ))
        }
      </>
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
          <h2>{t('edit_team_of_players')}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <GridContainer style={{ marginTop: 20 }}>
                {renderForm()}
                {canEdit && (
                  <GridItem xs={12} style={{ marginTop: 30 }}>
                    <Button
                      type="submit"
                      disabled={isLoading || !isValid || submitting}
                      fullWidth
                      style={{ marginBottom: 10 }}
                    >
                      {t('save_settings_button')}
                    </Button>
                  </GridItem>
                )}
              </GridContainer>
            </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
