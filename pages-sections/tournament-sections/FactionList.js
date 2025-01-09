import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Button, Chip } from "@mui/material";
import Card from "../../components/Card/Card";
import styles from "/styles/jss/nextjs-material-kit/sections/singlePlayerStyle.js";
import { useTranslation } from "next-i18next";
import PokemonView from "../../components/PokemonView/PokemonView";
import getValidLabel from "../../api/getValidLabel";
import NoPlayers from "../../components/NoPlayers/NoPlayers";
import Tooltip from "@mui/material/Tooltip";
import cleanText from "../../utils/cleanText";

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
  const { players, factions, metaLogos, onPlayer, onDeletePlayer, isHost, showValid, e, session } = props;
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
      if (factionsWithPlayers[factionIndex].admins?.includes(playerObj.id)) {
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

  useEffect(() => {
    if (e == null) {
      return;
    }
    onSearch(e);
  }, [e]);

  const onSearch = (e) => {
    const searchString = e.target.value.toLowerCase();
    setSearchedFactions(factions.filter((faction) => {
      const factionName = faction.name.toLowerCase();
      const includedInFaction = factionName.includes(searchString);
      const includedInPlayers = faction.players.filter((p) => p.name.toLowerCase().includes(searchString)).length > 0;
      return includedInPlayers || includedInFaction;
    }));
  }

  const renderStats = (player) => {
    if (player?.wins == null) {
      return null;
    }
    const { wins, losses, gameWins, gameLosses } = player;
    return (
      <Chip
        style={{ marginLeft: 10, marginTop: 7.5 }}
        label={t('winLoss', { wins, losses, gameWins, gameLosses })}
      />
    )
  }

  const noSearchResults = searchedFactions == null || searchedFactions.length <= 0;
  const hasWaitlist = session === "unified";

  if (factions == null || factions.length <= 0) {
    return <NoPlayers />
  }

  return (
    <div>
      {
        noSearchResults ? <p>{t('no_factions_in_search')}</p>
        : searchedFactions?.map((faction, index) => {
          const position = index + 1;
          const name = cleanText(faction.name);
          const description = cleanText(faction.description);
          const isWaitlisted = hasWaitlist && position > 128;
          return (
            <Card key={faction.key}>
              <div className={classes.factionNameRow}>
                <h3 style={{ marginLeft: 30, marginRight: 30 }}>
                  {hasWaitlist ? `${position}. ` : ""}
                  {name}
                  {isWaitlisted
                    ? (
                      <Tooltip title={t("waitlist_tooltip")}>
                        <b style={{ color: "orange" }}> {t("waitlisted")}</b>
                      </Tooltip>
                    )
                    : ""
                  }
                </h3>
                <div style={{ marginTop: 7.5 }}>
                  {renderStats(faction)}
                </div>
              </div>
              <p style={{ marginLeft: 30, marginRight: 30 }}>{description}</p>
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
                        {renderStats(player)}
                      </div>
                      <div>
                        <Button onClick={() => onPlayer(player.name)}>
                          {t("view_profile")}
                        </Button>
                        {
                          (isHost && !player.removed) && (<Button color="error" onClick={() => {
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
          )
        })
      }
    </div>
  )
}
