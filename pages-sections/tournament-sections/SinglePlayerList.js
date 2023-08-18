import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import { Button } from "@mui/material";
import Card from "../../components/Card/Card";
import styles from "/styles/jss/nextjs-material-kit/sections/singlePlayerStyle.js";
import CustomInput from "../../components/CustomInput/CustomInput.js";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(styles);

export default function SinglePlayerList(props) {
  const { players, onPlayer } = props;
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchedPlayers, setSearchedPlayers] = useState([]);

  useEffect(() => {
    setSearchedPlayers(players);
  }, [players]);

  const onSearch = (e) => {
    const searchString = e.target.value;
    setSearchedPlayers(players.filter((val) => val.name.includes(searchString)));
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
          style={{ maxWidth: 80 }}
        />
        <h5>{pokemonObj.speciesName}</h5>
        <p>{t("cp")}: {pokemonObj.cp}</p>
      </div>
    ))
  }

  const noSearchResults = searchedPlayers == null || searchedPlayers.length <= 0;

  if (players == null || players.length <= 0) {
    return <p>{t('no_players_in_tournament')}</p>
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
        : searchedPlayers?.map((player) => (
          <Card>
            <div className={classes.root}>
              <div className={classes.playerNameRow}>
                <h4>{player.name}</h4>
                <Button onClick={() => onPlayer(player.name)}>
                  {t("view_profile")}
                </Button>
              </div>
              <div className={classes.pokemonRow}>
                {renderPokemon(player.pokemon)}
              </div>
            </div>
          </Card>
        ))
      }
    </div>
  )
}
