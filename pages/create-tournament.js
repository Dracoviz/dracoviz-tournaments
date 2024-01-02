import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Router, { useRouter } from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import { useForm } from "react-hook-form";
import { useTranslation } from 'next-i18next';
import getRoundLengthLabel from "../api/getRoundLengthLabel";

import styles from "/styles/jss/nextjs-material-kit/pages/createTournamentPage.js";
import { Button, Checkbox, Select, InputLabel, MenuItem, CircularProgress } from "@mui/material";
import Card from "../components/Card/Card";
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

export default function CreateTournament() {
  const { t } = useTranslation();
  const [authId, setAuthId] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm({
    defaultValues: {
      maxTeamSize: 1,
      maxMatchTeamSize: 1,
    }
  });
  const router = useRouter();
  const hasMultipleMetas = watch("hasMultipleMetas");
  const maxMatchTeamSize = watch("maxMatchTeamSize");
  const isTeamTournament = watch("isTeamTournament");
  const bracketType = watch("bracketType");
  const theMetas = watch("metas");
  const gameAmount = watch("gameAmount");
  const cpVisibility = watch("cpVisibility");
  const hpVisibility = watch("hpVisibility");
  const movesetVisibility = watch("movesetVisibility");
  const purifiedVisibility = watch("purifiedVisibility");
  const bestBuddyVisibility = watch("bestBuddyVisibility");
  const nicknameVisibility = watch("nicknameVisibility");
  const timeControl = watch("timeControl");
  const draftMode = watch("draftMode");
  const isPrivate = watch("isPrivate");

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

  const onTeamTournamentToggle = () => {
    // Note, we are looking at the previous isTeamTournament state, so logic is inversed
    if (isTeamTournament) {
      setValue("maxTeamSize", 1);
      setValue("maxMatchTeamSize", 1);
      setValue("metas", [theMetas?.[0]] ?? []);
      setValue("hasMultipleMetas", false);
    }
  }
  
  const onPlayPokemonPress = () => {
    setIsLoading(true);
    setTimeout(() => {
      const title = prompt(t("play_preset_prompt"));
      if (title == null) {
        setIsLoading(false);
        return;
      }
      setValue("name", title);
      setValue("timeControl", 0);
      setValue("maxTeams", 128);
      setValue("maxTeamSize", 1);
      setValue("maxMatchTeamSize", 1);
      setValue("metas", ["Play Pokemon 2024"]);
      setValue("hasMultipleMetas", false);
      setValue("bracketType", "none");
      setValue("isPrivate", true);
      setValue("cpVisibility", "global");
      setValue("hpVisibility", "hidden");
      setValue("movesetVisibility", "global");
      setValue("purifiedVisibility", "global");
      setValue("bestBuddyVisibility", "global");
      setValue("nicknameVisibility", "hidden");
      setValue("draftMode", "none");
      setIsLoading(false);
    }, 100)
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    fetchApi("session/create/", "POST", { x_session_id: authId, "Content-Type": "application/json" }, JSON.stringify(data))
      .then(response => response.json())
      .then(newData => {
        if (newData?.error != null) {
          alert(t(newData?.error));
          return;
        }
        const { id } = newData;
        Router.push(`/tournament/${id}`);
      })
      .catch((err) => {
        alert(t(err));
      });
    setIsLoading(false);
  }

  const goHome = () => {
    router.push("/");
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
          value={theMetas?.[index]}
        >
          <MenuItem value="Great League">{t("great_league")}</MenuItem>
          <MenuItem value="Ultra League">{t("ultra_league")}</MenuItem>
          <MenuItem value="Master League">{t("master_league")}</MenuItem>
          <MenuItem value="Play Pokemon 2024">Play! Pokémon Championship Series 2024</MenuItem>
          <MenuItem value="Region Cup">Region Cup</MenuItem>
          <MenuItem value="Maota Cup">Maota Cup</MenuItem>
          <MenuItem value="Merciless Cup">Syndicate (The Chronicles)</MenuItem>
          <MenuItem value="Fateful Cup">Syndicate (Fateful Cup)</MenuItem>
          <MenuItem value="Arctic Cup">Flash (Arctic Cup)</MenuItem>
          <MenuItem value="Wasteland Cup">Wasteland Cup</MenuItem>
          <MenuItem value="Nuu Cup">Nuu Cup</MenuItem>
          <MenuItem value="Solitude Cup">Syndicate (Solitude Cup)</MenuItem>
          <MenuItem value="Enchanted Domain">Enchanted Domain</MenuItem>
          <MenuItem value="Serene Domain">Serene Domain</MenuItem>
          <MenuItem value="Primordial Domain">Primordial Domain</MenuItem>
          <MenuItem value="Knockout Cup">Knockout Cup</MenuItem>
          <MenuItem value="Naruto Cup">Naruto Cup</MenuItem>
          <MenuItem value="Turok Cup">Turok Cup</MenuItem>
          <MenuItem value="Vanu Cup">Vanu Cup</MenuItem>
        </Select>
      </GridItem>
    ))
  }, [hasMultipleMetas, maxMatchTeamSize]);

  const classes = useStyles();
  const roundLabels = getRoundLengthLabel(t);

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
                <h2>{t("create_a_tournament")}</h2>
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
                <h2>{t("create_a_tournament")}</h2>
                <Button onClick={onPlayPokemonPress}>
                  {t("generate_play_pokemon_preset")}
                </Button>
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
                      ...register("description", { maxLength: 5000 })
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
                <GridItem xs={12} md={7} style={{ marginBottom: 10 }}>
                  <InputLabel>{t("round_length")}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`timeControl`, { required: true})}
                    value={timeControl}
                  >
                    {Object.keys(roundLabels).map((k) => (
                      <MenuItem value={k} key={k}>{roundLabels[k]}</MenuItem>
                    ))}
                  </Select>
                </GridItem>
                <GridItem xs={12} md={7}>
                  <InputLabel>{t("bracket_type")}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`bracketType`, { required: true})}
                    value={bracketType}
                  >
                    <MenuItem value="none">{t("bracket_type_none")}</MenuItem>
                    <MenuItem value="swiss">{t("bracket_type_swiss")}</MenuItem>
                    <MenuItem value="roundrobin">{t("bracket_type_round_robin")}</MenuItem>
                  </Select>
                  <small>
                    Note: Brackets currently only work for single player tournaments only
                  </small>
                </GridItem>
                {
                  (bracketType === "swiss" || bracketType === "roundrobin") && (
                    <>
                      <GridItem xs={12} md={7} style={{ marginTop: 10 }}>
                        <InputLabel>{t("game_amount_label")}</InputLabel>
                        <Select
                          fullWidth
                          {...register(`gameAmount`, { required: true})}
                        >
                          <MenuItem value={1}>1</MenuItem>
                          <MenuItem value={3}>3</MenuItem>
                          <MenuItem value={5}>5</MenuItem>
                        </Select>
                      </GridItem>
                      {
                        (gameAmount != null && gameAmount > 0) &&
                        <GridItem xs={12} md={7} style={{ marginTop: 10 }}>
                          <InputLabel>{t("bye_award_label")}</InputLabel>
                          <Select
                            fullWidth
                            {...register(`byeAward`, { required: true})}
                          >
                            {
                              Array(gameAmount).fill(0).map((_, i) => (
                                <MenuItem value={i + 1}>{i + 1}</MenuItem>
                              ))
                            }
                          </Select>
                        </GridItem>
                      }
                      <GridItem xs={12} md={7}>
                        {t("play_all_matches_label")}
                          <Checkbox {...register("playAllMatches")}/>
                      </GridItem>
                      <GridItem xs={12} md={7}>
                        {t("require_both_players_to_report")}
                          <Checkbox {...register("requireBothPlayersToReport")}/>
                      </GridItem>
                    </>
                  )
                }
                {
                  bracketType === "none" && (
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
                  )
                }
                <GridItem xs={12} md={7}>
                  {t("is_tournament_private")}
                    <Checkbox {...register("isPrivate")} checked={isPrivate}/>
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
                      ...register("maxTeams", { required: true, min: 3, max: 300 })
                    }}
                    error={errors.maxTeams}
                  />
                </GridItem>
                <GridItem xs={12} md={6}>
                  <InputLabel style={{ marginTop: 10 }}>{t("cp_visibility")}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`cpVisibility`, { required: true })}
                    value={cpVisibility}
                  >
                    <MenuItem value="none">{t("visibility_none")}</MenuItem>
                    <MenuItem value="hidden">{t("visibility_hidden")}</MenuItem>
                    <MenuItem value="global">{t("visibility_global")}</MenuItem>
                  </Select>
                </GridItem>
                <GridItem xs={12} md={6}>
                  <InputLabel style={{ marginTop: 10 }}>{t("hp_visibility")}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`hpVisibility`, { required: true })}
                    value={hpVisibility}
                  >
                    <MenuItem value="none">{t("visibility_none")}</MenuItem>
                    <MenuItem value="hidden">{t("visibility_hidden")}</MenuItem>
                    <MenuItem value="global">{t("visibility_global")}</MenuItem>
                  </Select>
                </GridItem>
                <GridItem xs={12} md={6}>
                  <InputLabel style={{ marginTop: 10 }}>{t("moveset_visibility")}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`movesetVisibility`, { required: true})}
                    value={movesetVisibility}
                  >
                    <MenuItem value="none">{t("visibility_none")}</MenuItem>
                    <MenuItem value="hidden">{t("visibility_hidden")}</MenuItem>
                    <MenuItem value="global">{t("visibility_global")}</MenuItem>
                  </Select>
                </GridItem>
                <GridItem xs={12} md={6}>
                  <InputLabel style={{ marginTop: 10 }}>{t("purified_visibility")}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`purifiedVisibility`, { required: true})}
                    value={purifiedVisibility}
                  >
                    <MenuItem value="none">{t("visibility_none")}</MenuItem>
                    <MenuItem value="hidden">{t("visibility_hidden")}</MenuItem>
                    <MenuItem value="global">{t("visibility_global")}</MenuItem>
                  </Select>
                </GridItem>
                <GridItem xs={12} md={6}>
                  <InputLabel style={{ marginTop: 10 }}>{t("best_buddy_visibility")}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`bestBuddyVisibility`, { required: true})}
                    value={bestBuddyVisibility}
                  >
                    <MenuItem value="none">{t("visibility_none")}</MenuItem>
                    <MenuItem value="hidden">{t("visibility_hidden")}</MenuItem>
                    <MenuItem value="global">{t("visibility_global")}</MenuItem>
                  </Select>
                </GridItem>
                <GridItem xs={12} md={6}>
                  <InputLabel style={{ marginTop: 10 }}>{t("nickname_visibility")}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`nicknameVisibility`, { required: true})}
                    value={nicknameVisibility}
                  >
                    <MenuItem value="none">{t("visibility_none")}</MenuItem>
                    <MenuItem value="hidden">{t("visibility_hidden")}</MenuItem>
                  </Select>
                </GridItem>
                <GridItem xs={12} md={6}>
                  <InputLabel style={{ marginTop: 10 }}>{t("draft_mode")}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`draftMode`, { required: true })}
                    value={draftMode}
                  >
                    <MenuItem value="none">{t("draft_mode_none")}</MenuItem>
                    <MenuItem value="team">{t("draft_mode_team")}</MenuItem>
                    <MenuItem value="global">{t("draft_mode_global")}</MenuItem>
                  </Select>
                </GridItem>
                <GridItem xs={12} md={7}>
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    {t("is_team_tournament")}
                    <Checkbox {...register("isTeamTournament")} onClick={onTeamTournamentToggle}/>
                  </div>
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
                {
                  isTeamTournament ? (
                    <GridItem xs={12}>
                      {t("tournament_multiple_metas_enabled")}
                      <Checkbox {...register("hasMultipleMetas")}/>
                    </GridItem>
                  ) : null
                }
                {renderMetas()}
                <GridItem xs={12}>
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    {t("hide_teams_from_host")}
                    <Checkbox {...register("hideTeamsFromHost")} />
                  </div>
                </GridItem>
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
      <Footer />
    </div>
  );
}