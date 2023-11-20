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
import { useForm, Controller } from "react-hook-form";
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import styles from "/styles/jss/nextjs-material-kit/pages/createTournamentPage.js";
import { Button, TextField, Select, InputLabel, MenuItem, CircularProgress, Autocomplete } from "@mui/material";
import Card from "../../components/Card/Card";
import fetchApi from "../../api/fetchApi";
import formatMove from "../../api/formatMove";
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

export default function Team() {
  const { t } = useTranslation();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [movesRequired, setMovesRequired] = useState(false);
  const [hpRequired, setHpRequired] = useState(false);
  const [cpRequired, setCpRequired] = useState(false);
  const [purifiedRequired, setPurifiedRequired] = useState(false);
  const [bestBuddyRequired, setBestBuddyRequired] = useState(false);
  const [nicknameRequired, setNicknameRequired] = useState(false);
  const [pokemonOptions, setPokemonOptions] = useState({});
  const [pokemonItems, setPokemonItems] = useState([]);
  const [metaClasses, setMetaClasses] = useState(null);
  const { register, control, setValue, handleSubmit, watch, formState: { errors, isValid } } = useForm();
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
      setMovesRequired(data.movesetsRequired);
      setCpRequired(data.cpRequired);
      setHpRequired(data.hpRequired);
      setPurifiedRequired(data.purifiedRequired);
      setBestBuddyRequired(data.bestBuddyRequired);
      setNicknameRequired(data.nicknameRequired);
      setPokemonOptions(data.pokemonData);
      setMetaClasses(data.metaClasses);
      setValue("cp", data.cp, { shouldValidate: false });
      setValue("hp", data.hp, { shouldValidate: false });
      setValue("pokemon", data.pokemon, { shouldValidate: false });
      setValue("chargedMoves", data.chargedMoves, { shouldValidate: false });
      setValue("fastMoves", data.fastMoves, { shouldValidate: false });
      setValue("nickname", data.nickname, { shouldValidate: false });
      setValue("purified", data.purified, { shouldValidate: false });
      setValue("bestBuddy", data.bestBuddy, { shouldValidate: false });
      setValue("metaClass", data.metaClass, { shouldValidate: false });
      setPokemonItems(Object.keys(data.pokemonData)
        .map((key)=>{
          return {
            label: data.pokemonData[key].speciesName,
            id: key
          }
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
        Router.push(`/tournament/${session}`)
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
      <MenuItem value={move} key={move}>{formatMove(move, router.locale)}</MenuItem>
    ))
  }

  const renderChargedMoves = (index) => {
    const thePokemon = pokemonOptions[pokemons[index]];
    if (thePokemon == null) {
      return null;
    }
    const chargedMoves = thePokemon.chargedMoves.map((move) => (
      <MenuItem value={move} key={move}>{formatMove(move, router.locale)}</MenuItem>
    ));
    if (thePokemon.tags?.includes("shadoweligible")) {
      chargedMoves.push(<MenuItem value={"RETURN"} key={"RETURN"}>Return</MenuItem>);
    }
    if (thePokemon.tags?.includes("shadow")) {
      chargedMoves.push(<MenuItem value={"FRUSTRATION"} key={"FRUSTRATION"}>Frustration</MenuItem>);
    }
    return chargedMoves;
  }

  const renderPokemonSelector = (index) => {
    return (
      <Controller
        control={control}
        name={`pokemon.${index}`}
        rules={{
          required: true,
          validate: (value) => pokemonOptions[value] != null
        }}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            onChange={(_event, item) => {
              onChange(item?.id ?? "");
            }}
            value={value}
            options={pokemonItems}
            isOptionEqualToValue={(option, value) => {
              return (option?.id ?? option) === value;
            }}
            getOptionSelected={(option, value) =>
              value === undefined || value === "" || option.id === value
            }
            getOptionLabel={(item) => item.label ?? pokemonOptions[item]?.speciesName ?? ""}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('team_pokemon_label', { index: index + 1 })}
                variant="standard"
                required
                style={{ marginBottom: 10 }}
                error={errors[`pokemon.${index}`]}
              />
            )}
          />
        )}
      />
    )
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
              {renderPokemonSelector(index)}
              {
                nicknameRequired && (
                  <CustomInput
                    labelText={t('nickname')}
                    id={`nickname.${index}`}
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      ...register(
                        `nickname.${index}`,
                        {
                          required: nicknameRequired,
                        }),
                    }}
                  />
                )
              }
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
                      ...register(
                        `cp.${index}`,
                        {
                          required: cpRequired,
                          min: 1,
                          max: 100000
                        }),
                    }}
                  />
                )
              }
              {
                hpRequired && (
                  <CustomInput
                    labelText={t('hp')}
                    id={`hp.${index}`}
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      type: "number",
                      ...register(
                        `hp.${index}`,
                        {
                          required: hpRequired,
                          min: 1,
                          max: 100000
                        }),
                    }}
                  />
                )
              }
              {
                purifiedRequired && (
                  <>
                    <InputLabel style={{ marginTop: 15 }}>{t('purified')}</InputLabel>
                    <Select
                      fullWidth
                      {...register(`purified.${index}`)}
                      value={watch(`purified.${index}`) ?? false}
                      variant="standard"
                    >
                      <MenuItem value={false}>{t("no")}</MenuItem>
                      <MenuItem value={true}>{t("yes")}</MenuItem>
                    </Select>
                  </>
                )
              }
              {
                bestBuddyRequired && (
                  <>
                    <InputLabel style={{ marginTop: 15 }}>{t('best_buddy')}</InputLabel>
                    <Select
                      fullWidth
                      {...register(`bestBuddy.${index}`)}
                      value={watch(`bestBuddy.${index}`) ?? false}
                      variant="standard"
                    >
                      <MenuItem value={false}>{t("no")}</MenuItem>
                      <MenuItem value={true}>{t("yes")}</MenuItem>
                    </Select>
                  </>
                )
              }
              {
                movesRequired && (
                  <>
                    <InputLabel style={{ marginTop: 15 }}>{t('fast_move')}</InputLabel>
                    <Select
                      fullWidth
                      {...register(`fastMoves.${index}`, {
                        required: movesRequired,
                        validate: (value) => pokemonOptions[pokemons[index]]?.fastMoves?.includes(value)
                      })}
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
                      {...register(`chargedMoves.${index}.0`, {
                        required: movesRequired,
                      })}
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
                      {...register(`chargedMoves.${index}.1`, {
                        required: movesRequired,
                      })}
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
                {
                  (metaClasses != null && metaClasses.length > 0) && (
                    <GridItem xs={12} style={{ marginBottom: 30 }}>
                      <InputLabel style={{ marginTop: 15 }}>{t('meta_class')}</InputLabel>
                      <Select
                        fullWidth
                        {...register(`metaClass`)}
                        value={watch(`metaClass`)}
                        variant="standard"
                      >
                        {
                          metaClasses.map((m => (
                            <MenuItem value={m}>{m}</MenuItem>
                          )))
                        }
                      </Select>
                    </GridItem>
                  )
                }
                {renderPokemon()}
                {canEdit && (
                  <GridItem xs={12} style={{ marginTop: 30 }}>
                    <Button
                      type="submit"
                      disabled={isLoading || submitting || !isValid}
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
