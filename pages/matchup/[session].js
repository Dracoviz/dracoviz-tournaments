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
  Select,
  InputLabel,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle
} from "@mui/material";
import Card from "../../components/Card/Card";
import fetchApi from "../../api/fetchApi";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import PokemonView from "../../components/PokemonView/PokemonView";
import PlayerInfoModal from "../../pages-sections/tournament-sections/PlayerInfoModal";

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

const exampleMatchup = {
  gameAmount: 5,
  playAllMatches: false,
  score: [0, 2],
  opponent: {
    name: "Opponent Name",
    discord: "2",
    friendCode: "2",
    telegram: "2",
    pokemon: [
      {
          "sid": 14720,
          "speciesName": "Abomasnow (Shadow)",
          "cp": 1489,
          "chargedMoves": [
              "WEATHER_BALL_ICE",
              "ENERGY_BALL"
          ],
          "fastMove": "POWDER_SNOW"
      },
      {
          "sid": 5472,
          "speciesName": "Lanturn",
          "cp": 1483,
          "chargedMoves": [
              "SURF",
              "THUNDERBOLT"
          ],
          "fastMove": "SPARK"
      },
      {
          "sid": 8320,
          "speciesName": "Swampert (Shadow)",
          "cp": 1492,
          "chargedMoves": [
              "HYDRO_CANNON",
              "SLUDGE_WAVE"
          ],
          "fastMove": "WATER_GUN"
      },
      {
          "sid": 24064,
          "speciesName": "Araquanid",
          "cp": 1491,
          "chargedMoves": [
              "BUBBLE_BEAM",
              "BUG_BUZZ"
          ],
          "fastMove": "BUG_BITE"
      },
      {
          "sid": 19072,
          "speciesName": "Galvantula",
          "cp": 1496,
          "chargedMoves": [
              "DISCHARGE",
              "LUNGE"
          ],
          "fastMove": "VOLT_SWITCH"
      },
      {
          "sid": 22112,
          "speciesName": "Dragalge",
          "cp": 1499,
          "chargedMoves": [
              "AQUA_TAIL",
              "OUTRAGE"
          ],
          "fastMove": "DRAGON_TAIL"
      }
    ]
  },
  player: {
    name: "Player Name",
    pokemon: [
      {
          "sid": 14720,
          "speciesName": "Abomasnow (Shadow)",
          "cp": 1489,
          "chargedMoves": [
              "WEATHER_BALL_ICE",
              "ENERGY_BALL"
          ],
          "fastMove": "POWDER_SNOW"
      },
      {
          "sid": 5472,
          "speciesName": "Lanturn",
          "cp": 1483,
          "chargedMoves": [
              "SURF",
              "THUNDERBOLT"
          ],
          "fastMove": "SPARK"
      },
      {
          "sid": 8320,
          "speciesName": "Swampert (Shadow)",
          "cp": 1492,
          "chargedMoves": [
              "HYDRO_CANNON",
              "SLUDGE_WAVE"
          ],
          "fastMove": "WATER_GUN"
      },
      {
          "sid": 24064,
          "speciesName": "Araquanid",
          "cp": 1491,
          "chargedMoves": [
              "BUBBLE_BEAM",
              "BUG_BUZZ"
          ],
          "fastMove": "BUG_BITE"
      },
      {
          "sid": 19072,
          "speciesName": "Galvantula",
          "cp": 1496,
          "chargedMoves": [
              "DISCHARGE",
              "LUNGE"
          ],
          "fastMove": "VOLT_SWITCH"
      },
      {
          "sid": 22112,
          "speciesName": "Dragalge",
          "cp": 1499,
          "chargedMoves": [
              "AQUA_TAIL",
              "OUTRAGE"
          ],
          "fastMove": "DRAGON_TAIL"
      }
    ]
  }
}

const useStyles = makeStyles(styles);

export default function Matchup() {
  const { t } = useTranslation();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, control, setValue, handleSubmit, watch, formState: { errors, isValid } } = useForm();
  const router = useRouter();
  const [authId, setAuthId] = useState();
  const { session, player1, player2 } = router.query;

  const getMatchup = (id) => {
    setAuthId(id);
    setValue("gamesWon", exampleMatchup.score[0]);
    setValue("gamesLost", exampleMatchup.score[1]);
    // setIsLoading(true);
    // fetchApi(`matchup/?tournamentId=${session}&player1=${player1}&player2=${player2}`, "GET", {
    //   x_session_id: id,
    // })
    // .then(response => response.json())
    // .then(data => {
    //   if (data.error != null) {
    //     alert(t(data.error));
    //     Router.push(`/tournament/${session}`);
    //     return;
    //   }
      setIsLoading(false);
    // });
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

  const onSubmit = (data) => {
    console.log(data);
  }

  const openProfileModal = () => {
    setShowProfile(true);
  }

  const openReportModal = () => {
    setShowReport(true);
  }

  const onClose = () => {
    setShowProfile(false);
    setShowReport(false);
  }

  const hasScore = exampleMatchup.score != null && exampleMatchup.score[0] + exampleMatchup.score[1] > 0;

  const classes = useStyles();

  const getGamesCount = () => {
    const { gameAmount, playAllMatches } = exampleMatchup;
    if (playAllMatches) {
      return gameAmount;
    }
    return gameAmount / 2 + gameAmount % 2;
  }

  const renderScoreReportModal = () => {
    const menuItems = Array.from({ length: getGamesCount() + 1 }, (_value, index) => index);
    return (
      <Dialog
      open={showReport}
      onClose={onClose}
      aria-labelledby="report-modal-slide-title"
      aria-describedby="report-modal-slide-description"
    >
      <DialogTitle
        id="report-modal-slide-title"
      >
        {hasScore ? t("report_score") : t("edit_score")}
      </DialogTitle>
      <DialogContent
        id="report-modal-slide-description"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <GridContainer>
            <GridItem xs={12}>
              <InputLabel>{t("games_won_label")}</InputLabel>
              <Select
                fullWidth
                style={{ backgroundColor: "#abf7e7" }}
                {...register(`gamesWon`, { required: true})}
                value={watch("gamesWon")}
              >
                {
                  menuItems.map((i) => (
                    <MenuItem value={i} key={i}>{i}</MenuItem>
                  ))
                }
              </Select>
            </GridItem>
            <GridItem xs={12} style={{ marginTop: 10, marginBottom: 10 }}>
              <InputLabel>{t("games_lost_label")}</InputLabel>
              <Select
                fullWidth
                style={{ backgroundColor: "#f7abab" }}
                {...register(`gamesLost`, { required: true })}
                value={watch("gamesLost")}
              >
                {
                  menuItems.map((i) => (
                    <MenuItem value={i} key={i}>{i}</MenuItem>
                  ))
                }
              </Select>
            </GridItem>
            <GridItem xs={12}>
              <Button
                type="submit"
                fullWidth
              >{t("save")}</Button>
            </GridItem>
          </GridContainer>
        </form>
      </DialogContent>
  </Dialog>
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
          <h2>{t('your_matchup')}</h2>
          <PlayerInfoModal open={showProfile} data={exampleMatchup.opponent} onClose={onClose} />
          {renderScoreReportModal()}
          <GridContainer style={{ marginTop: 20 }}>
            {
              isLoading ? (
                <CircularProgress />
              ) : (
                <>
                  <GridItem xs={12}>
                    <div className={classes.profileRow}>
                      <h3>{exampleMatchup.opponent.name}</h3>
                      <Button
                        onClick={openProfileModal}
                        type="button"
                      >
                        {t("view_profile")}
                      </Button>
                    </div>
                    <Card className={classes.pokemonCard}>
                      <PokemonView pokemon={exampleMatchup.opponent.pokemon} />
                    </Card>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={openReportModal}
                    >
                      {hasScore ? t("edit_score") : t("report_score")}
                    </Button>
                    <h3>{t("tournament_see_pokemon_button")}</h3>
                    <Card className={classes.pokemonCard}>
                      <PokemonView pokemon={exampleMatchup.player.pokemon} />
                    </Card>
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
