import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Router from "next/router";
import Header from "/components/Header/Header.js";
import HeaderLinks from "/components/Header/HeaderLinks.js";
import Footer from "/components/Footer/Footer.js";
import firebase from 'firebase/compat/app';
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/router';

import styles from "/styles/jss/nextjs-material-kit/pages/createTournamentPage.js";
import { Button, Checkbox, Select, InputLabel, MenuItem, CircularProgress } from "@mui/material";
import Card from "../../../components/Card/Card";
import fetchApi from "../../../api/fetchApi";

const useStyles = makeStyles(styles);

export default function Team() {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pokemonOptions, setPokemonOptions] = useState({});
  const [pokemonItems, setPokemonItems] = useState([]);
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    defaultValues: {
      pokemon: ["dracovish", "dracovish", "dracovish", "dracovish", "dracovish", "dracovish"]
    }
  });
  const router = useRouter();
  const pokemons = watch("pokemon");

  const getPokemonOptions = (authId) => {
    const { session, meta } = router.query;
    setIsLoading(true);
    fetchApi(`pokemon?session=${session}&meta=${meta}`, "GET")
    .then(response => response.json())
    .then(data => {
      setPokemonOptions(data);
      setPokemonItems(Object.keys(data).map((key)=>{
        return <MenuItem value={key} key={key}>{data[key].speciesName}</MenuItem>
      }));
      setIsLoading(false);
    });
  }

  const onSubmit = (data) => {
    console.log(data);
  }

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      const doesUserExist = !!user;
      setIsSignedIn(doesUserExist);
      if (!doesUserExist) {
        Router.push("/login");
      } else {
        getPokemonOptions(user.uid);
      }
    });
    return () => unregisterAuthObserver();
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const classes = useStyles();

  const renderPokemon = () => {
    if (isLoading || pokemonOptions[pokemons[0]] == null) {
      return (<CircularProgress />);
    }
    return Array(6).fill(0).map((p, index) => (
      <GridItem md={6}>
        <Card style={{ marginTop: 0 }}>
          <GridContainer style={{ paddingLeft: 20, paddingRight: 20 }}>
            <GridItem xs={4} md={3} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img
                src={`https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${pokemonOptions[pokemons[index]].sid}.png/public`}
                alt={pokemonOptions[pokemons[index]].speciesName}
                style={{ maxHeight: 110, maxWidth: 110 }}
              />
            </GridItem>
            <GridItem xs={8} md={9} style={{ marginTop: 10 }}>
              <InputLabel>Pokémon {index + 1}</InputLabel>
              <Select
                fullWidth
                {...register(`pokemon.${index}`, { required: true })}
                defaultValue={"dracovish"}
                variant="standard"
                style={{ marginBottom: 5 }}
              >
                {pokemonItems}
              </Select>
              <CustomInput
                labelText="CP"
                id={`cp.${index}`}
                formControlProps={{
                  fullWidth: true
                }}
                inputProps={{
                  type: "number",
                  ...register(`cp.${index}`, { required: true, min: 1, max: 100000 }),
                }}
                error={errors.maxMatchTeamSize}
              />
              <div>
                Shadow? <Checkbox {...register(`shadow.${index}`)} />
              </div>
            </GridItem>
          </GridContainer>
        </Card>
      </GridItem>
    ))
  }

  return (
    <div>
      <Header
        absolute
        color="white"
        rightLinks={<HeaderLinks isSignedIn={isSignedIn} />}
      />
      <div className={classes.pageHeader}>
        <div className={classes.main}>
          <h2>Register your team of Pokémon</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <GridContainer style={{ marginTop: 20 }}>
                {renderPokemon()}
                <GridItem xs={12} style={{ marginTop: 30 }}>
                  <Button
                    type="submit"
                    disabled={isLoading || !isValid}
                    fullWidth
                    style={{ marginBottom: 10 }}
                  >
                    Save Team
                  </Button>
                </GridItem>
              </GridContainer>
            </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
