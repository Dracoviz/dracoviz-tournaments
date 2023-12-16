import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Button, Chip } from "@mui/material";
import Card from "../../components/Card/Card";
import styles from "/styles/jss/nextjs-material-kit/sections/singlePlayerStyle.js";
import CustomInput from "../../components/CustomInput/CustomInput.js";
import { useTranslation } from "next-i18next";
import PokemonView from "../../components/PokemonView/PokemonView";
import getValidLabel from "../../api/getValidLabel";
import NoPlayers from "../../components/NoPlayers/NoPlayers";

const useStyles = makeStyles(styles);

const sortingAlgo = (a, b) => {
  if (a.wins != null) {
    return ((b.wins * 10) + b.gameWins) - ((a.wins * 10) + a.gameWins);
  }
  if (a.name?.toLowerCase() < b.name?.toLowerCase()) {
    return -1;
  }
  if (a.name?.toLowerCase() > b.name?.toLowerCase()) {
    return 1;
  }
  return 0;
}

export default function SinglePlayerList(props) {
  const { players, onPlayer, onDeletePlayer, isHost, showValid } = props;
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchedPlayers, setSearchedPlayers] = useState([]);

  useEffect(() => {
    setSearchedPlayers(players);
  }, [players]);

  const onSearch = (e) => {
    const targetValue = e.target.value;
    const searchStrings = targetValue.split("&");
    const matchingPlayers = players.filter(player => {
      const matches = searchStrings.some(searchStr => {
        return player.name.toLowerCase().includes(searchStr.toLowerCase())
      });
      return matches;
    });
    setSearchedPlayers(matchingPlayers);
  }

  const renderStats = (player) => {
    if (player?.wins == null) {
      return null;
    }
    const { wins, losses, gameWins, gameLosses } = player;
    return (
      <Chip
        style={{ marginLeft: 10 }}
        label={t('winLoss', { wins, losses, gameWins, gameLosses })}
      />
    )
  }

  const noSearchResults = searchedPlayers == null || searchedPlayers.length <= 0;

  if (players == null || players.length <= 0) {
    return <NoPlayers />
  }

  return (
    <div>
      <CustomInput
        labelText={t("search_players")}
        id="players"
        formControlProps={{
          fullWidth: true
        }}
        inputProps={{
          onChange: onSearch
        }}
      />
      {
        noSearchResults ? <p>{t('no_players_in_search')}</p>
        : searchedPlayers.sort(sortingAlgo)?.map((player) => (
          <Card>
            <div className={classes.root}>
              <div className={`${classes.playerNameRow} realign`}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <h4 style={{ textDecoration: player.removed ? "line-through" : "none" }}>
                    {player.name} {getValidLabel(showValid, player.valid)}
                  </h4>
                  {renderStats(player)}
                </div>
                <div>
                  <Button onClick={() => onPlayer(player.name)}>
                    {t("view_profile")}
                  </Button>
                  {
                    (isHost && !player.removed) && (<Button color="error" onClick={() => {
                      if (confirm(t("confirm_remove_player"))) {
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
          </Card>
        ))
      }
    </div>
  )
}
