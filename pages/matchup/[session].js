import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Router from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styles from "/styles/jss/nextjs-material-kit/pages/matchupPage.js";
import {
  Button,
  CircularProgress,
} from "@mui/material";
import Card from "../../components/Card/Card";
import fetchApi from "../../api/fetchApi";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import PokemonView from "../../components/PokemonView/PokemonView";
import PlayerInfoModal from "../../pages-sections/tournament-sections/PlayerInfoModal";
import ReportScoreModal from "../../pages-sections/tournament-sections/ReportScoreModal";

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

export default function Matchup() {
  const { t } = useTranslation();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const formProps = useForm();
  const { setValue, formState: { isSubmitting } } = formProps;
  const router = useRouter();
  const [authId, setAuthId] = useState();
  const { session } = router.query;

  const getMatchup = (id) => {
    setAuthId(id);
    setIsLoading(true);
    fetchApi(`session/matchup/?tournamentId=${session}`, "GET", {
      x_session_id: id,
    })
    .then(response => response.json())
    .then(newData => {
      if (newData.error != null) {
        alert(t(newData.error));
        Router.push(`/tournament/${session}`);
        return;
      }
      setData(newData);
      setValue("player1", newData.score[0]);
      setValue("player2", newData.score[1]);
      setIsLoading(false);
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
        getMatchup(user.uid);
      }
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const onSubmit = async (scores) => {
    const { player1, player2 } = scores;
    const response = await fetchApi(`session/report/`, "POST", {
      "x_session_id": authId,
      "Content-Type": "application/json"
    }, JSON.stringify({
      tournamentId: session,
      player1,
      player2,
    }));
    const newData = await response.json();
    if (newData.error != null) {
      alert(t(newData.error));
    } else {
      Router.push(`/tournament/${session}`);
    }
  }

  const openProfileModal = () => {
    setShowProfile(true);
  }

  const openReportModal = () => {
    setShowReport(true);
  }

  const onClose = () => {
    if (isSubmitting) {
      return;
    }
    setShowProfile(false);
    setShowReport(false);
  }

  const hasScore = data?.score != null && data.score[0] + data.score[1] > 0;

  const classes = useStyles();

  const hasPokemon = data?.player.pokemon != null && data?.player.pokemon.length > 0;

  return (
    <div>
      <Header
        absolute
        color="white"
        rightLinks={<HeaderLinks isSignedIn={isSignedIn} />}
      />
      <div className={classes.pageHeader}>
        <div className={classes.main}>
          <h2>{t('your_matchup')}</h2>
          <PlayerInfoModal open={showProfile} data={data?.opponent} onClose={onClose} />
          <ReportScoreModal
            data={data}
            onClose={onClose}
            visible={showReport}
            onSubmit={onSubmit}
            formProps={formProps}
          />
          <GridContainer style={{ marginTop: 20 }}>
            {
              isLoading ? (
                <CircularProgress />
              ) : (
                <>
                  <GridItem xs={12}>
                    {
                      data?.hasOpponent ? (
                        <>
                          <div className={classes.profileRow}>
                            <h3>{data?.opponent.name}</h3>
                            <Button
                              onClick={openProfileModal}
                              type="button"
                            >
                              {t("view_profile")}
                            </Button>
                          </div>
                          <Card className={classes.pokemonCard}>
                            <PokemonView pokemon={data?.opponent.pokemon} />
                          </Card>
                          {
                            (data?.touched !== true) && (
                              <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={openReportModal}
                              >
                                {hasScore ? t("edit_score") : t("report_score")}
                              </Button>
                            )
                          }
                        </>
                      ) : (
                        <p>{t("no_opponent_notice")}</p>
                      )
                    }
                    {
                      hasPokemon && (
                        <>
                          <h3>{t("tournament_see_pokemon_button")}</h3>
                          <Card className={classes.pokemonCard}>
                            <PokemonView pokemon={data?.player.pokemon} />
                          </Card>
                        </>
                      )
                    }
                  </GridItem>
                </>
              )
            }
          </GridContainer>
        </div>
      </div>
      <Footer />
    </div>
  );
}
