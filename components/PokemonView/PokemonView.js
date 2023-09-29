import React, { useCallback } from "react";
import { makeStyles } from "@mui/styles";
import styles from "../../styles/jss/nextjs-material-kit/sections/singlePlayerStyle";
import { useTranslation } from "next-i18next";
import formatMove from "../../api/formatMove";

const useStyles = makeStyles(styles);

export default function PokemonView(props) {
  const classes = useStyles();
  const { pokemon } = props;
  const { t } = useTranslation();
  if (pokemon == null || pokemon.length <= 0) {
    return null;
  }
  
  const renderPokemon = useCallback(() => {
    return pokemon.map((pokemonObj) => (
      <div className={classes.pokemonRoot}>
        <img
          src={`https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${pokemonObj.sid}.png/public`}
          alt={pokemonObj.speciesName}
          style={{width: 100, height: 100, objectFit: 'contain'}}
        />
        <h5>{pokemonObj.speciesName}</h5>
        <p>
          {pokemonObj.cp != null && (<div>{t("cp")}: {pokemonObj.cp}</div>)}
          {pokemonObj.fastMove != null && (<div>{formatMove(pokemonObj.fastMove)}</div>)}
          {pokemonObj.chargedMoves != null && (<div>{formatMove(pokemonObj.chargedMoves[0])}, {formatMove(pokemonObj.chargedMoves[1])}</div>)}
        </p>
      </div>
    ))
  }, [pokemon])

  return (
    <div className={classes.pokemonRow}>
      {renderPokemon()}
    </div>
  )
}
