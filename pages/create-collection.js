import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Router, { useRouter } from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import firebase from 'firebase/compat/app';
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import { useForm } from "react-hook-form";
import { useTranslation } from 'next-i18next';

import styles from "/styles/jss/nextjs-material-kit/pages/createTournamentPage.js";
import { Button, CircularProgress } from "@mui/material";
import fetchApi from "../api/fetchApi";
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

export default function CreateCollection() {
  const { t } = useTranslation();
  const [authId, setAuthId] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const classes = useStyles();
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm();
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

  const goHome = () => {
    router.push("/");
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    fetchApi("series/create/", "POST", { x_session_id: authId, "Content-Type": "application/json" }, JSON.stringify(data))
      .then(response => response.json())
      .then(newData => {
        if (newData?.error != null) {
          alert(t(newData?.error));
          return;
        }
        const { slug } = newData;
        Router.push(`/collection/${slug}`);
      })
      .catch((err) => {
        alert(t(err));
      });
    setIsLoading(false);
  }

  if (isLoading) {
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
                <h2>{t("create_a_collection")}</h2>
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <GridContainer>
              <GridItem xs={12}>
                <h2>{t("create_a_collection")}</h2>
              </GridItem>
              <GridItem xs={12}>
                <CustomInput
                  labelText={t("collection_name")}
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
              <GridItem xs={12}>
                <CustomInput
                  labelText={t("collection_description")}
                  id="description"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    multiline: true,
                    ...register("description", { maxLength: 5000 })
                  }}
                  error={errors.description}
                />
              </GridItem>
              <GridItem xs={12}>
                <CustomInput
                  labelText={t("collection_slug")}
                  id="slug"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    ...register("slug", { required: true, pattern: /^[a-zA-Z0-9\-]+$/ })
                  }}
                  error={errors.slug}
                />
                <small>{t("collection_slug_tip")}</small>
              </GridItem>
              <GridItem xs={12}>
                <Button
                  type="submit"
                  disabled={isLoading || !isValid}
                  fullWidth
                  style={{ marginBottom: 10, marginTop: 20 }}
                >
                  {t("create_collection")}
                </Button>
                <Button
                  onClick={goHome}
                  color="error"
                  fullWidth
                >
                  Cancel
                </Button>
              </GridItem>
            </GridContainer>
          </form>
        </div>
      </div>
    </div>
  );
}