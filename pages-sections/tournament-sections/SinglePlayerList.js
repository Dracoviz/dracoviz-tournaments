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
      <div>
        <img
          src={`https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${pokemonObj.sid}.png/public`}
          alt={pokemonObj.speciesName}
          style={{ maxHeight: 100, maxWidth: 100 }}
        />
        <b>{pokemonObj.speciesName}</b>
        <p>
          {t("cp")}: {pokemonObj.cp}
          {pokemonObj.shadow && t("pokemon_shadow")}
        </p>
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
            <img src={player.avatar} alt={player.name} height={60} width={60} />
            <div>
              <div>
                <b>{player.name}</b>
                <Button onClick={() => onPlayer(player.name)}>
                  {t("view_profile")}
                </Button>
              </div>
              {renderPokemon(player.pokemon)}
            </div>
          </Card>
        ))
      }
    </div>
  )
}
