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
import { useTranslation } from 'next-i18next';

import styles from "/styles/jss/nextjs-material-kit/pages/createTournamentPage.js";
import {
  Button, Select, InputLabel, MenuItem, CircularProgress, Checkbox, FormControlLabel,
} from "@mui/material";
import TeamBuilder from "/components/TeamBuilder/TeamBuilder.js";
import PvPokeDialog from "/components/TeamBuilder/PvPokeDialog.js";
import fetchApi from "../../api/fetchApi";
import {
  formValuesToUnified, unifiedToFormValues, TEAM_SIZE,
} from "../../api/teamFormat";
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
  const [savedTeams, setSavedTeams] = useState([]);
  const [selectedSavedTeam, setSelectedSavedTeam] = useState("");
  const [saveTeam, setSaveTeam] = useState(false);
  const [isPvPokeOpen, setIsPvPokeOpen] = useState(false);
  const {
    register, control, setValue, getValues, handleSubmit, watch,
    formState: { errors, isValid },
  } = useForm();
  const router = useRouter();
  const [authId, setAuthId] = useState();
  const { session } = router.query;
  const metaClass = watch("metaClass");

  const getPokemonOptions = (id) => {
    setAuthId(id);
    setIsLoading(true);
    fetchApi(`pokemon/?tournamentId=${session}`, "GET", {
      x_session_id: id,
      x_locale: router.locale,
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

  // The API only returns saved teams that are complete and legal for this tournament's meta, so
  // anything here is safe to load. Classes still have to be narrowed client-side, because the
  // player picks theirs on this page.
  const getSavedTeams = (id) => {
    fetchApi(`player-teams/all/?tournamentId=${session}`, "GET", {
      x_session_id: id,
    })
    .then(response => response.json())
    .then(data => {
      if (data.error != null) {
        return;
      }
      setSavedTeams(data.teams ?? []);
    });
  }

  const eligibleSavedTeams = savedTeams.filter((team) => (
    metaClasses == null
    || metaClasses.length <= 0
    || metaClass == null
    || team.validClasses == null
    || team.validClasses.length <= 0
    || team.validClasses.includes(metaClass)
  ));

  const onLoadSavedTeam = (teamId) => {
    setSelectedSavedTeam(teamId);
    const team = savedTeams.find((x) => x.id === teamId);
    if (team == null) {
      return;
    }
    const values = unifiedToFormValues(team.pokemon, pokemonOptions);
    for (let index = 0; index < TEAM_SIZE; index += 1) {
      setValue(`pokemon.${index}`, values.pokemon[index] ?? "", { shouldValidate: true });
      setValue(`fastMoves.${index}`, values.fastMoves[index] ?? "", { shouldValidate: true });
      setValue(`chargedMoves.${index}.0`, values.chargedMoves[index]?.[0] ?? "", { shouldValidate: true });
      setValue(`chargedMoves.${index}.1`, values.chargedMoves[index]?.[1] ?? "", { shouldValidate: true });
      setValue(`cp.${index}`, values.cp[index] ?? "", { shouldValidate: true });
      setValue(`hp.${index}`, values.hp[index] ?? "", { shouldValidate: true });
      setValue(`nickname.${index}`, values.nickname[index] ?? "", { shouldValidate: true });
      setValue(`purified.${index}`, values.purified[index] ?? false, { shouldValidate: true });
      setValue(`bestBuddy.${index}`, values.bestBuddy[index] ?? false, { shouldValidate: true });
      setValue(`level.${index}`, values.level[index] ?? "");
      setValue(`attackIv.${index}`, values.attackIv[index] ?? "");
      setValue(`defenseIv.${index}`, values.defenseIv[index] ?? "");
      setValue(`hpIv.${index}`, values.hpIv[index] ?? "");
    }
  }

  const onSubmit = (data) => {
    setSubmitting(true);
    fetchApi(`session/register/`, "POST",
      {
        x_session_id: authId, "Content-Type": "application/json"
      }, JSON.stringify({ ...data, tournamentId: session })
    )
    .then(response => response.json())
    .then(async (result) => {
      if (result.error != null) {
        alert(t(result.error));
        setSubmitting(false);
        return;
      }
      // Registration is what matters here; saving to the library is a separate call so a failure
      // there cannot undo it, but the player has to be told the two outcomes differed.
      if (saveTeam) {
        const saveResult = await fetchApi(`player-teams/create/`, "POST",
          {
            x_session_id: authId, "Content-Type": "application/json"
          }, JSON.stringify({
            name: data.savedTeamName,
            description: "",
            metas: [],
            pokemon: formValuesToUnified(data, TEAM_SIZE, pokemonOptions),
          })
        ).then((response) => response.json()).catch(() => ({ error: "api_unauthorized" }));

        if (saveResult?.error != null) {
          alert(t("registered_but_team_not_saved", { error: t(saveResult.error) }));
          Router.push(`/tournament/${session}`);
          setSubmitting(false);
          return;
        }
      }
      alert(t("saved"));
      Router.push(`/tournament/${session}`)
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
        getSavedTeams(user.uid);
      }
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

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
                            <MenuItem value={m} key={m}>{m}</MenuItem>
                          )))
                        }
                      </Select>
                    </GridItem>
                  )
                }
                {canEdit && eligibleSavedTeams.length > 0 && (
                  <GridItem xs={12} style={{ marginBottom: 30 }}>
                    <InputLabel>{t('load_saved_team')}</InputLabel>
                    <Select
                      fullWidth
                      value={selectedSavedTeam}
                      onChange={(event) => onLoadSavedTeam(event.target.value)}
                      variant="standard"
                    >
                      {eligibleSavedTeams.map((team) => (
                        <MenuItem value={team.id} key={team.id}>{team.name}</MenuItem>
                      ))}
                    </Select>
                    <small>{t('load_saved_team_tip')}</small>
                  </GridItem>
                )}
                {canEdit && (
                  <GridItem xs={12} style={{ marginBottom: 20 }}>
                    <Button onClick={() => setIsPvPokeOpen(true)}>{t('pvpoke_title')}</Button>
                  </GridItem>
                )}
                {
                  isLoading
                    ? <GridItem xs={12}><CircularProgress /></GridItem>
                    : (
                      <TeamBuilder
                        control={control}
                        register={register}
                        watch={watch}
                        errors={errors}
                        pokemonOptions={pokemonOptions}
                        pokemonItems={pokemonItems}
                        teamSize={TEAM_SIZE}
                        canEdit={canEdit}
                        locale={router.locale}
                        requirements={{
                          moves: movesRequired,
                          cp: cpRequired,
                          hp: hpRequired,
                          purified: purifiedRequired,
                          bestBuddy: bestBuddyRequired,
                          nickname: nicknameRequired,
                        }}
                      />
                    )
                }
                {canEdit && (
                  <GridItem xs={12} style={{ marginTop: 30 }}>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={saveTeam}
                          onChange={(event) => setSaveTeam(event.target.checked)}
                        />
                      )}
                      label={t('save_team_permanently')}
                    />
                    {saveTeam && (
                      <CustomInput
                        labelText={t('team_name')}
                        id="savedTeamName"
                        formControlProps={{ fullWidth: true }}
                        inputProps={{
                          ...register("savedTeamName", { required: saveTeam, maxLength: 100 }),
                        }}
                        error={errors.savedTeamName}
                      />
                    )}
                  </GridItem>
                )}
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
      <PvPokeDialog
        open={isPvPokeOpen}
        onClose={() => setIsPvPokeOpen(false)}
        getValues={getValues}
        setValue={setValue}
        pokemonOptions={pokemonOptions}
        teamSize={TEAM_SIZE}
      />
      <Footer />
    </div>
  );
}
