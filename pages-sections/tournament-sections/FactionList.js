import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Button } from "@mui/material";
import Card from "../../components/Card/Card";
import styles from "/styles/jss/nextjs-material-kit/sections/singlePlayerStyle.js";
import CustomInput from "../../components/CustomInput/CustomInput.js";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(styles);

const byTournamentPosition = (a, b) => {
  if (a.tournamentPosition === -1 && b.tournamentPosition === -1) {
    return 1;
  }
  if (a.tournamentPosition === -1 && b.tournamentPosition !== -1) {
    return 1;
  }
  if (a.tournamentPosition !== -1 && b.tournamentPosition === -1) {
    return -1;
  }
  return a.tournamentPosition - b.tournamentPosition;
}

export default function FactionList(props) {
  const { players, factions, metaLogos, onPlayer } = props;
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchedFactions, setSearchedFactions] = useState([]);

  useEffect(() => {
    if (players == null || players.length <= 0 || factions == null || factions.length <= 0) {
      return;
    }
    const factionsWithPlayers = factions;
    players.forEach((player) => {
      const factionIndex = factionsWithPlayers.findIndex((f) => f.key === player.factionId);
      if (factionIndex <= -1) {
        return;
      }
      const playerObj = player;
      if (factionsWithPlayers[factionIndex].admins?.includes(playerObj.session)) {
        playerObj.isCaptain = true;
      }
      if (factionsWithPlayers[factionIndex].players == null) {
        factionsWithPlayers[factionIndex].players = [playerObj];
      } else {
        factionsWithPlayers[factionIndex].players.push(playerObj);
      }
    })
    setSearchedFactions(factionsWithPlayers);
  }, [factions, players]);

  const onSearch = (e) => {
    const searchString = e.target.value;
    setSearchedFactions(factions.filter((val) => val.name.toLowerCase().includes(searchString.toLowerCase())));
  }

  const renderPokemon = (pokemon) => {
    if (pokemon == null || pokemon.length <= 0) {
      return null;
    }
    return pokemon.map((pokemonObj) => (
      <div className={classes.pokemonRoot}>
        <img
          src={`https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${pokemonObj.sid}.png/public`}
          alt={pokemonObj.speciesName}
          style={{width: 100, height: 100, objectFit: 'contain'}}
        />
        <h5>{pokemonObj.speciesName}</h5>
        <p>{t("cp")}: {pokemonObj.cp}</p>
      </div>
    ))
  }

  const noSearchResults = searchedFactions == null || searchedFactions.length <= 0;

  if (factions == null || factions.length <= 0) {
    return <p>{t('no_factions_in_tournament')}</p>
  }

  return (
    <div>
      <CustomInput
        labelText={t("search_faction")}
        id="factions"
        formControlProps={{
          fullWidth: true
        }}
        inputProps={{
          onChange: onSearch
        }}
      />
      {
        noSearchResults ? <p>{t('no_factions_in_search')}</p>
        : searchedFactions?.map((faction) => (
          <Card key={faction.key}>
            <h3 style={{ marginLeft: 30, marginRight: 30 }}>{faction.name}</h3>
            <p style={{ marginLeft: 30, marginRight: 30 }}>{faction.description}</p>
            {
              faction?.players?.sort(byTournamentPosition).map((player, index) => (
                <div className={classes.root}>
                  <div className={classes.playerNameRow}>
                    <div className={classes.playerMetaRow}>
                      {(player.tournamentPosition > -1) && (
                        <img
                          src={metaLogos[index]}
                          style={{width: 50, height: 50, marginRight: 10, objectFit: 'contain'}}
                        />
                      )}
                      <h4>{player.name} {player.isCaptain ? t("captain") : ""}</h4>
                    </div>
                    <Button onClick={() => onPlayer(player.name)}>
                      {t("view_profile")}
                    </Button>
                  </div>
                  <div className={classes.pokemonRow}>
                    {renderPokemon(player.pokemon)}
                  </div>
                </div>
              ))
            }
          </Card>
        ))
      }
    </div>
  )
}
