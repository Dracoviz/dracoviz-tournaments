import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Router, { useRouter } from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import Card from "/components/Card/Card.js";
import PokemonView from "/components/PokemonView/PokemonView.js";
import { Button, Chip, CircularProgress } from "@mui/material";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import styles from "/styles/jss/nextjs-material-kit/pages/myTeamsPage.js";
import fetchApi from "../api/fetchApi";
import { unifiedToDisplayPokemon, TEAM_SIZE } from "../api/teamFormat";
import { getMetaLabel } from "../api/getMetaOptions";
import TeamEditModal from "../pages-sections/my-teams-sections/TeamEditModal";

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'footer',
      ])),
    },
  }
}

const useStyles = makeStyles(styles);

export default function MyTeams() {
  const { t } = useTranslation();
  const router = useRouter();
  const classes = useStyles();
  const [authId, setAuthId] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [teams, setTeams] = useState([]);
  const [pokemonOptions, setPokemonOptions] = useState(null);
  const [pokemonItems, setPokemonItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const loadTeams = (id) => fetchApi("player-teams/all/", "GET", {
    x_session_id: id,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error != null) {
        alert(t(data.error));
        return;
      }
      setTeams(data.teams);
    });

  const loadPage = (id) => {
    setAuthId(id);
    setIsLoading(true);
    // No tournamentId: just the dex, with no tournament's requirements attached.
    Promise.all([
      fetchApi("pokemon/", "GET", { x_session_id: id, x_locale: router.locale })
        .then((response) => response.json())
        .then((data) => {
          if (data.error != null) {
            alert(t(data.error));
            return;
          }
          setPokemonOptions(data.pokemonData);
          setPokemonItems(Object.keys(data.pokemonData).map((key) => ({
            label: data.pokemonData[key].speciesName,
            id: key,
          })));
        }),
      loadTeams(id),
    ]).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      if (!doesUserExist) {
        Router.push("/login");
        return;
      }
      loadPage(user.uid);
    });
    return () => unregisterAuthObserver();
  }, []);

  const onSave = (payload) => {
    setIsSaving(true);
    const isEdit = payload.teamId != null;
    fetchApi(
      isEdit ? "player-teams/edit/" : "player-teams/create/",
      "POST",
      { x_session_id: authId, "Content-Type": "application/json" },
      JSON.stringify(payload),
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.error != null) {
          alert(t(data.error, { details: data.details }));
          return;
        }
        setEditing(null);
        return loadTeams(authId);
      })
      .finally(() => setIsSaving(false));
  };

  const onDelete = (team) => {
    if (!window.confirm(t("confirm_delete_team", { name: team.name }))) {
      return;
    }
    fetchApi(
      "player-teams/delete/",
      "POST",
      { x_session_id: authId, "Content-Type": "application/json" },
      JSON.stringify({ teamId: team.id }),
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.error != null) {
          alert(t(data.error));
          return;
        }
        return loadTeams(authId);
      });
  };

  const renderValidity = (team) => {
    if (!team.isComplete) {
      return (
        <span className={classes.invalid}>
          ⚠️ {t("team_incomplete", { count: team.pokemon.length, total: TEAM_SIZE })}
        </span>
      );
    }
    if (team.isValid) {
      return <span className={classes.valid}>✅ {t("team_valid")}</span>;
    }
    const failing = team.validations.filter((v) => !v.valid).map((v) => getMetaLabel(v.meta, t));
    return (
      <span className={classes.invalid}>
        ⚠️ {t("team_invalid_for", { metas: failing.join(", ") })}
      </span>
    );
  };

  const renderTeams = () => {
    if (teams.length <= 0) {
      return <p>{t("no_saved_teams")}</p>;
    }
    return teams.map((team) => (
      <Card key={team.id} className={classes.teamCard}>
        <h4 className={classes.teamTitle}>{team.name}</h4>
        {team.description !== "" && team.description != null && (
          <p className={classes.teamDescription}>{team.description}</p>
        )}
        <div className={classes.teamMeta}>
          {renderValidity(team)}
          {team.metas.map((meta) => (
            <Chip key={meta} label={getMetaLabel(meta, t)} size="small" />
          ))}
        </div>
        <PokemonView pokemon={unifiedToDisplayPokemon(team.pokemon, pokemonOptions)} />
        <div className={classes.teamActions}>
          <Button onClick={() => setEditing(team)}>{t("edit")}</Button>
          <Button color="error" onClick={() => onDelete(team)}>{t("delete_team")}</Button>
        </div>
      </Card>
    ));
  };

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
              <h2>{t("my_teams")}</h2>
              <p>{t("my_teams_description")}</p>
            </GridItem>
            <GridItem xs={12} style={{ marginBottom: 20 }}>
              <Button
                disabled={isLoading || pokemonOptions == null}
                onClick={() => setEditing({})}
              >
                {t("create_team")}
              </Button>
            </GridItem>
            <GridItem xs={12}>
              {isLoading ? <CircularProgress /> : renderTeams()}
            </GridItem>
          </GridContainer>
        </div>
        <Footer />
      </div>
      <TeamEditModal
        open={editing != null}
        // An empty object is the "create" sentinel; a saved team always has an id.
        team={editing?.id == null ? null : editing}
        onClose={() => setEditing(null)}
        onSave={onSave}
        isSaving={isSaving}
        pokemonOptions={pokemonOptions}
        pokemonItems={pokemonItems}
      />
    </div>
  );
}
