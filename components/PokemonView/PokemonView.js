import React, { useCallback } from "react";
import { makeStyles } from "@mui/styles";
import styles from "../../styles/jss/nextjs-material-kit/sections/singlePlayerStyle";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import formatMove from "../../api/formatMove";
import Shadow from "../../public/img/draco_icon_circle_shadow.png";
import Purified from "../../public/img/draco_icon_circle_purified.png";
import BestBuddy from "../../public/img/draco_icon_circle_buddy.png";
import useWindowSize from "../../utils/use-window-size";

const useStyles = makeStyles(styles);

function getTemplateColumns(width) {
  if (width > 1000) {
    return "16.6% 16.6% 16.6% 16.6% 16.6% 16.6% ";
  }
  return "33% 33% 33%";
}

export default function PokemonView(props) {
  const classes = useStyles();
  const { locale } = useRouter();
  const { pokemon } = props;
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const gridTemplateColumns = getTemplateColumns(width);
  
  const renderPokemon = useCallback(() => {
    return pokemon.map((pokemonObj) => (
      <div className={classes.pokemonRoot}>
        <div className={classes.pokemonImgWrapper}>
          {(pokemonObj.speciesName.includes("Shadow")
            || pokemonObj.speciesName.includes("しゃどう")
            ) && (
            <div className={classes.iconOverlayBottom}>
              <img
                src={Shadow.src}
                alt="shadow"
                style={{width: 20, height: 20, objectFit: 'contain'}}
              />
            </div>
          )}
          {pokemonObj.purified === true && (
            <div className={classes.iconOverlayBottom}>
              <img
                src={Purified.src}
                alt="purified"
                style={{width: 20, height: 20, objectFit: 'contain'}}
              />
            </div>
          )}
          {pokemonObj.bestBuddy === true && (
            <div className={classes.iconOverlayTop}>
              <img
                src={BestBuddy.src}
                alt="best buddy"
                style={{width: 20, height: 20, objectFit: 'contain'}}
              />
            </div>
          )}
          <img
            src={`https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${pokemonObj.sid}.png/public`}
            alt={pokemonObj.speciesName}
            style={{width: 70, height: 70, objectFit: 'contain'}}
          />
        </div>
        <div>
          <h5 style={{ fontSize: "0.9rem" }}><b>{pokemonObj.speciesName}</b></h5>
          <p style={{ fontSize: "0.8rem" }}>
            {pokemonObj.nickname != null && (<div>{t("nickname")}: {pokemonObj.nickname}</div>)}
            {pokemonObj.cp != null && (<div>{t("cp")}: {pokemonObj.cp}</div>)}
            {pokemonObj.hp != null && (<div>{t("hp")}: {pokemonObj.hp}</div>)}
            {pokemonObj.fastMove != null && (<div>{formatMove(pokemonObj.fastMove, locale)}</div>)}
            {pokemonObj.chargedMoves != null && (<div>{formatMove(pokemonObj.chargedMoves[0], locale)}<br/>{formatMove(pokemonObj.chargedMoves[1], locale)}</div>)}
          </p>
        </div>
      </div>
    ))
  }, [pokemon])

  if (pokemon == null || pokemon.length <= 0) {
    return null;
  }

  return (
    <div className={classes.pokemonRow} style={{ gridTemplateColumns }}>
      {renderPokemon()}
    </div>
  )
}
