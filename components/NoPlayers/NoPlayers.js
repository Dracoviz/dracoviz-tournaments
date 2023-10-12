import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import Blissey from "../../public/img/blissey.png";
import Diglett from "../../public/img/diglett.png";
import Sentret from "../../public/img/sentret.png";

const mons = [
  {
    image: Sentret,
    name: "Sentret"
  },
  {
    image: Blissey,
    name: "Blissey"
  },
  {
    image: Diglett,
    name: "Diglett"
  }
]

function getRandomElementFromArray(array) {
  // Check if the array is not empty
  if (array.length === 0) {
    return undefined; // Return undefined for an empty array
  }
  // Generate a random index within the array length
  const randomIndex = Math.floor(Math.random() * array.length);
  // Return the random element from the array
  return array[randomIndex];
}

export default function NoPlayers() {
  const [thePokemon, ] = useState(getRandomElementFromArray(mons));
  const { image, name } = thePokemon;
  const { t } = useTranslation();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h3>{t('no_players_in_tournament', { name })}</h3>
      <img
        src={image.src}
        height={300}
        width={300}
        alt="no players"
      />
    </div>
  )
}
