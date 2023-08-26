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
import { Button, Checkbox, Select, InputLabel, MenuItem, CircularProgress } from "@mui/material";
import Card from "../../components/Card/Card";
import fetchApi from "../../api/fetchApi";

const useStyles = makeStyles(styles);

export default function Team() {
  const { t } = useTranslation();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [movesRequired, setMovesRequired] = useState(false);
  const [cpRequired, setCpRequired] = useState(false);
  const [pokemonOptions, setPokemonOptions] = useState({});
  const [pokemonItems, setPokemonItems] = useState([]);
  const { register, setValue, handleSubmit, watch, formState: { errors, isValid } } = useForm();
  const router = useRouter();
  const pokemons = watch("pokemon");
  const [authId, setAuthId] = useState();
  const { session } = router.query;

  const getPokemonOptions = (id) => {
    setAuthId(id);
    setIsLoading(true);
    fetchApi(`pokemon/?tournamentId=${session}`, "GET", {
      x_session_id: id,
    })
    .then(response => response.json())
    .then(data => {
      if (data.error != null) {
        alert(t(data.error));
        Router.push(`/tournament/${session}`);
        return;
      }
      setCanEdit(data.canEdit);
      setMovesRequired(data.movesRequired);
      setCpRequired(data.cpRequired);
      setPokemonOptions(data.pokemonData);
      setValue("cp", data.cp, { shouldValidate: false });
      setValue("pokemon", data.pokemon, { shouldValidate: false });
      setValue("chargedMoves", data.chargedMoves, { shouldValidate: false });
      setValue("fastMoves", data.fastMoves, { shouldValidate: false });
      setPokemonItems(Object.keys(data.pokemonData).map((key)=>{
        return <MenuItem value={key} key={key}>{data.pokemonData[key].speciesName}</MenuItem>
      }));
      setIsLoading(false);
    });
  }

  const onSubmit = (data) => {
    setSubmitting(true);
    fetchApi(`session/register/`, "POST",
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
        getPokemonOptions(user.uid);
      }
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const classes = useStyles();

  const renderFastMoves = (index) => {
    const thePokemon = pokemonOptions[pokemons[index]];
    if (thePokemon == null) {
      return null;
    }
    return thePokemon.fastMoves.map((move) => (
      <MenuItem value={move} key={move}>{move}</MenuItem>
    ))
  }

  const renderChargedMoves = (index) => {
    const thePokemon = pokemonOptions[pokemons[index]];
    if (thePokemon == null) {
      return null;
    }
    const chargedMoves = thePokemon.chargedMoves.map((move) => (
      <MenuItem value={move} key={move}>{move}</MenuItem>
    ));
    if (thePokemon.tags.includes("shadoweligible")) {
      chargedMoves.push(<MenuItem value={"RETURN"} key={"RETURN"}>RETURN</MenuItem>);
    }
    if (thePokemon.tags.includes("shadow")) {
      chargedMoves.push(<MenuItem value={"FRUSTRATION"} key={"FRUSTRATION"}>FRUSTRATION</MenuItem>);
    }
    return chargedMoves;
  }

  const renderPokemon = () => {
    if (isLoading || pokemonOptions == null) {
      return (<CircularProgress />);
    }
    return Array(6).fill(0).map((p, index) => (
      <GridItem md={6}>
        <Card style={{ marginTop: 0 }}>
          <GridContainer style={{ paddingLeft: 20, paddingRight: 2, pointerEvents: canEdit ? "auto" : "none" }}>
            <GridItem xs={4} md={3} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              {
                pokemons?.[index] == null ? <div /> : (
                  <img
                    src={`https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${pokemonOptions?.[pokemons[index]]?.sid}.png/public`}
                    alt={pokemonOptions?.[pokemons[index]]?.speciesName}
                    style={{ maxHeight: 100, maxWidth: 100 }}
                  />
                )
              }
            </GridItem>
            <GridItem xs={8} md={9} style={{ marginTop: 10 }}>
              <InputLabel>{t('team_pokemon_label', { index: index + 1 })}</InputLabel>
              <Select
                fullWidth
                {...register(`pokemon.${index}`, { required: true })}
                value={watch(`pokemon.${index}`)}
                variant="standard"
                style={{ marginBottom: 5 }}
              >
                {pokemonItems}
              </Select>
              {
                cpRequired && (
                  <CustomInput
                    labelText={t('cp')}
                    id={`cp.${index}`}
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      type: "number",
                      ...register(`cp.${index}`, { required: cpRequired, min: 1, max: 100000 }),
                    }}
                    error={errors.maxMatchTeamSize}
                  />
                )
              }
              {
                movesRequired && (
                  <>
                    <InputLabel style={{ marginTop: 15 }}>{t('fast_move')}</InputLabel>
                    <Select
                      fullWidth
                      {...register(`fastMoves.${index}`, { required: movesRequired })}
                      value={watch(`fastMoves.${index}`)}
                      variant="standard"
                    >
                      {
                        pokemons?.[index] == null
                          ? null
                          : renderFastMoves(index)
                      }
                    </Select>
                    <InputLabel style={{ marginTop: 15 }}>{t('charged_move')} 1</InputLabel>
                    <Select
                      fullWidth
                      {...register(`chargedMoves.${index}.0`, { required: movesRequired })}
                      value={watch(`chargedMoves.${index}.0`)}
                      variant="standard"
                    >
                      {
                        pokemons?.[index] == null
                          ? null
                          : renderChargedMoves(index)
                      }
                    </Select>
                    <InputLabel style={{ marginTop: 15 }}>{t('charged_move')} 2</InputLabel>
                    <Select
                      fullWidth
                      {...register(`chargedMoves.${index}.1`, { required: movesRequired })}
                      value={watch(`chargedMoves.${index}.1`)}
                      variant="standard"
                      style={{ marginBottom: 5 }}
                    >
                      <MenuItem value="None" key="None">None</MenuItem>
                      {
                        pokemons?.[index] == null
                          ? null
                          : renderChargedMoves(index)
                      }
                    </Select>
                  </>
                )
              }
            </GridItem>
          </GridContainer>
        </Card>
      </GridItem>
    ))
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
          <h2>{t('register_pokemon_name')}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <GridContainer style={{ marginTop: 20 }}>
                {renderPokemon()}
                {canEdit && (
                  <GridItem xs={12} style={{ marginTop: 30 }}>
                    <Button
                      type="submit"
                      disabled={isLoading || !isValid || submitting}
                      fullWidth
                      style={{ marginBottom: 10 }}
                    >
                      {t('save_team_button')}
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
