import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import Card from "/components/Card/Card.js";
import firebase from 'firebase/compat/app';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import CircularProgress from "@mui/material/CircularProgress";
import Router, { useRouter } from "next/router";
import { useTranslation } from 'next-i18next';
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

import styles from "/styles/jss/nextjs-material-kit/pages/loginPage.js";
import fetchApi from "../api/fetchApi";
import { track } from "../utils/analytics";
import { EVENT, PARAM, RESULT, SOURCE } from "../utils/analyticsEvents";
import LocaleSelect from "../components/LocaleSelect/LocaleSelect";

const useStyles = makeStyles(styles);

export default function LoginPage(props) {
  const { t } = useTranslation();
  const [cardAnimaton, setCardAnimation] = React.useState("cardHidden");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // `source` distinguishes a fresh interactive sign-in from an existing session
  // being restored by onAuthStateChanged -- otherwise every page load by a
  // signed-in user would look like a brand new login.
  const onSignIn = useCallback((user, source = SOURCE.AUTO, provider) => {
    setIsLoading(true);
    if (user != null) {
      const { uid } = user;
      fetchApi("shared/login/", "GET", {
        "x_session_id": uid,
      })
      .then(async (response) => {
        if (response.status === 200) {
          // Successfully found user
          const responseJSON = await response.json();
          track(EVENT.LOGIN_SUCCEEDED, {
            [PARAM.SOURCE]: source,
            [PARAM.PROVIDER]: provider,
            [PARAM.IS_NEW_USER]: responseJSON?.isNewUser === true,
            [PARAM.RESULT]: RESULT.SUCCESS,
          });
          if (router.query?.returnUrl != null) {
            Router.push(router.query?.returnUrl);
          } else {
            Router.push(`/?isNewUser=${responseJSON?.isNewUser}`);
          }
        } else {
          // Cannot generate user, delete firebase copy
          track(EVENT.LOGIN_FAILED, {
            [PARAM.SOURCE]: source,
            [PARAM.PROVIDER]: provider,
            [PARAM.ERROR_CODE]: `http_${response.status}`,
            [PARAM.RESULT]: RESULT.FAILURE,
          });
          alert("Failed to log you in. Please try again");
        }
      });
    }
    setIsLoading(false);
  }, []);

  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: (authResult) => {
        const { user } = authResult;
        onSignIn(user, SOURCE.MANUAL, authResult?.additionalUserInfo?.providerId);
        return false;
      },
      signInFailure: (error) => {
        track(EVENT.LOGIN_FAILED, {
          [PARAM.SOURCE]: SOURCE.MANUAL,
          [PARAM.ERROR_CODE]: error?.code ?? "firebase_error",
          [PARAM.RESULT]: RESULT.FAILURE,
        });
      },
    },
  };

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      onSignIn(user);
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  setTimeout(function () {
    setCardAnimation("");
  }, 700);

  const classes = useStyles();
  const { ...rest } = props;
  return (
    <div>
      <Header
        absolute
        color="white"
        rightLinks={<HeaderLinks isSignedIn={false} />}
        {...rest}
      />
      <div className={classes.pageHeader}>
        <div className={classes.main}>
          <div>
            <GridContainer>
              <GridItem xs={12}>
                <LocaleSelect />
              </GridItem>
              <GridItem xs={0} md={2} />
              <GridItem xs={12} md={8}>
                <Card className={classes[cardAnimaton]}>
                  <div className={classes.card}>
                    <h2>
                      <b>Pokémon GO</b>
                      <br />
                      {t("grassroots_tournaments")}
                    </h2>
                    <p style={{ marginBottom: 20 }}>{t("please_create_account_to_participate")}</p>
                    {isLoading
                      ? <CircularProgress className={classes.progress} />
                      : <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
                    }
                    <iframe
                      src="https://www.youtube.com/embed/ykFltS4b2MI?si=y__K2kTS2bXTPO5O"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Embedded youtube"
                      style={{ maxWidth: 600, width: "100%", border: "none", aspectRatio: "16/9" }}
                    />
                  </div>
                </Card>
              </GridItem>
            </GridContainer>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
