import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Button } from "@mui/material";
import Card from "../../components/Card/Card";
import styles from "/styles/jss/nextjs-material-kit/sections/singlePlayerStyle.js";
import CustomInput from "../../components/CustomInput/CustomInput.js";
import { useTranslation } from "next-i18next";
import Filter from "bad-words";
import PokemonView from "../../components/PokemonView/PokemonView";
import getValidLabel from "../../api/getValidLabel";
import NoPlayers from "../../components/NoPlayers/NoPlayers";

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

const filter = new Filter();
filter.addWords("racist"); //Darn Pocket

export default function FactionList(props) {
  const { players, factions, metaLogos, onPlayer, onDeletePlayer, isHost, showValid } = props;
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

  const cleanText = useCallback((text) => {
    if (filter?.clean == null || text == null || text === "") {
      return text;
    }
    return filter.clean(text);
  }, []);

  const onSearch = (e) => {
    const searchString = e.target.value.toLowerCase();
    setSearchedFactions(factions.filter((faction) => {
      const factionName = faction.name.toLowerCase();
      const includedInFaction = factionName.includes(searchString);
      const includedInPlayers = faction.players.filter((p) => p.name.toLowerCase().includes(searchString)).length > 0;
      return includedInPlayers || includedInFaction;
    }));
  }

  const noSearchResults = searchedFactions == null || searchedFactions.length <= 0;

  if (factions == null || factions.length <= 0) {
    return <NoPlayers />
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
            <h3 style={{ marginLeft: 30, marginRight: 30 }}>{cleanText(faction.name)}</h3>
            <p style={{ marginLeft: 30, marginRight: 30 }}>{cleanText(faction.description)}</p>
            {
              faction?.players?.sort(byTournamentPosition).map((player, index) => (
                <div className={classes.root} key={index}>
                  <div className={classes.playerNameRow}>
                    <div className={classes.playerMetaRow}>
                      {(player.tournamentPosition > -1) && (
                        <img
                          src={metaLogos[index]}
                          style={{width: 50, height: 50, marginRight: 10, objectFit: 'contain'}}
                        />
                      )}
                      <h4>{player.name} {player.isCaptain ? t("captain_label") : ""} {getValidLabel(showValid, player.valid)}</h4>
                    </div>
                    <div>
                      <Button onClick={() => onPlayer(player.name)}>
                        {t("view_profile")}
                      </Button>
                      {
                        isHost && (<Button color="error" onClick={() => {
                          if (confirm(t("confirm_remove_player_team"))) {
                            onDeletePlayer(player.name)
                          }
                        }}>
                          {t("remove_player")}
                        </Button>)
                      }
                    </div>
                  </div>
                  <PokemonView pokemon={player.pokemon} />
                </div>
              ))
            }
          </Card>
        ))
      }
    </div>
  )
}
