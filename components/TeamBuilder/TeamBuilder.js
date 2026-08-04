import React from "react";
import { Controller } from "react-hook-form";
import { TextField, Select, InputLabel, MenuItem, CircularProgress, Autocomplete } from "@mui/material";
import { useTranslation } from "next-i18next";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import Card from "/components/Card/Card.js";
import formatMove from "../../api/formatMove";
import { TEAM_SIZE } from "../../api/teamFormat";

/**
 * The Pokemon-picking half of a team form, shared by tournament registration and the My Teams page.
 *
 * The caller owns the `useForm` instance and this writes into it under the field names
 * `session/register` already expects (`pokemon.0`, `chargedMoves.0.1`, ...), so a form built from
 * this component can be submitted to that endpoint unchanged.
 *
 * `requirements` marks a field required *and* visible. `showOptional` additionally renders the
 * fields that are not required, which is what the standalone builder wants — there is no tournament
 * dictating what to collect, so it collects everything it can.
 */
export default function TeamBuilder(props) {
  const {
    control,
    register,
    watch,
    errors,
    pokemonOptions,
    pokemonItems,
    teamSize = TEAM_SIZE,
    canEdit = true,
    isLoading = false,
    requirements = {},
    showOptional = false,
    locale,
  } = props;
  const { t } = useTranslation();
  const pokemons = watch("pokemon");

  const shows = (field) => requirements[field] === true || showOptional;
  const slotFilled = (index) => pokemons?.[index] != null && pokemons[index] !== "";
  // When slots may be left empty (a saved team can be partial), a field is only required of the
  // slots that actually hold a Pokemon.
  const requires = (field, index) => requirements[field] === true
    && (requirements.allSlots !== false || slotFilled(index));

  const renderFastMoves = (index) => {
    const thePokemon = pokemonOptions[pokemons[index]];
    if (thePokemon == null) {
      return null;
    }
    return thePokemon.fastMoves.map((move) => (
      <MenuItem value={move} key={move}>{formatMove(move, locale)}</MenuItem>
    ))
  }

  const renderChargedMoves = (index) => {
    const thePokemon = pokemonOptions[pokemons[index]];
    if (thePokemon == null) {
      return null;
    }
    const chargedMoves = thePokemon.chargedMoves.map((move) => (
      <MenuItem value={move} key={move}>{formatMove(move, locale)}</MenuItem>
    ));
    if (thePokemon.tags?.includes("shadoweligible")) {
      chargedMoves.push(<MenuItem value={"RETURN"} key={"RETURN"}>Return</MenuItem>);
    }
    if (thePokemon.tags?.includes("shadow")) {
      chargedMoves.push(<MenuItem value={"FRUSTRATION"} key={"FRUSTRATION"}>Frustration</MenuItem>);
    }
    return chargedMoves;
  }

  const renderPokemonSelector = (index) => {
    return (
      <Controller
        control={control}
        name={`pokemon.${index}`}
        rules={{
          // A saved team may be a partial team, so an empty slot is only an error when every slot
          // is mandatory.
          required: requirements.allSlots !== false,
          validate: (value) => (
            (requirements.allSlots === false && (value == null || value === ""))
            || pokemonOptions[value] != null
          )
        }}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            onChange={(_event, item) => {
              onChange(item?.id ?? "");
            }}
            value={value ?? ""}
            options={pokemonItems}
            isOptionEqualToValue={(option, value) => {
              return (option?.id ?? option) === value;
            }}
            getOptionSelected={(option, value) =>
              value === undefined || value === "" || option.id === value
            }
            getOptionLabel={(item) => item.label ?? pokemonOptions[item]?.speciesName ?? ""}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('team_pokemon_label', { index: index + 1 })}
                variant="standard"
                required={requirements.allSlots !== false}
                style={{ marginBottom: 10 }}
                error={errors[`pokemon.${index}`]}
              />
            )}
          />
        )}
      />
    )
  }

  if (isLoading || pokemonOptions == null) {
    return (<CircularProgress />);
  }

  return Array(teamSize).fill(0).map((p, index) => (
    <GridItem md={6} key={index}>
      <Card style={{ marginTop: 0 }}>
        <GridContainer style={{ paddingLeft: 20, paddingRight: 2, pointerEvents: canEdit ? "auto" : "none" }}>
          <GridItem xs={4} md={3} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {
              pokemons?.[index] == null ? <div /> : (
                <img
                  src={`https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${pokemonOptions?.[pokemons[index]]?.sid}.png/public`}
                  alt={pokemonOptions?.[pokemons[index]]?.speciesName}
                  style={{ maxHeight: 100, maxWidth: 100 }}
                />
              )
            }
          </GridItem>
          <GridItem xs={8} md={9} style={{ marginTop: 10 }}>
            {renderPokemonSelector(index)}
            {/*
              Level and IVs are never edited here, but a PvPoke import supplies them and the saved
              team format stores them, so they ride along as hidden fields rather than being lost
              on the next save.
            */}
            <input type="hidden" {...register(`level.${index}`)} />
            <input type="hidden" {...register(`attackIv.${index}`)} />
            <input type="hidden" {...register(`defenseIv.${index}`)} />
            <input type="hidden" {...register(`hpIv.${index}`)} />
            {
              shows("nickname") && (
                <CustomInput
                  labelText={t('nickname')}
                  id={`nickname.${index}`}
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    ...register(
                      `nickname.${index}`,
                      {
                        required: requires("nickname", index),
                      }),
                  }}
                />
              )
            }
            {
              shows("cp") && (
                <CustomInput
                  labelText={t('cp')}
                  id={`cp.${index}`}
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    type: "number",
                    ...register(
                      `cp.${index}`,
                      {
                        required: requires("cp", index),
                        min: 1,
                        max: 100000
                      }),
                  }}
                />
              )
            }
            {
              shows("hp") && (
                <CustomInput
                  labelText={t('hp')}
                  id={`hp.${index}`}
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    type: "number",
                    ...register(
                      `hp.${index}`,
                      {
                        required: requires("hp", index),
                        min: 1,
                        max: 100000
                      }),
                  }}
                />
              )
            }
            {
              shows("purified") && (
                <>
                  <InputLabel style={{ marginTop: 15 }}>{t('purified')}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`purified.${index}`)}
                    value={watch(`purified.${index}`) ?? false}
                    variant="standard"
                  >
                    <MenuItem value={false}>{t("no")}</MenuItem>
                    <MenuItem value={true}>{t("yes")}</MenuItem>
                  </Select>
                </>
              )
            }
            {
              shows("bestBuddy") && (
                <>
                  <InputLabel style={{ marginTop: 15 }}>{t('best_buddy')}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`bestBuddy.${index}`)}
                    value={watch(`bestBuddy.${index}`) ?? false}
                    variant="standard"
                  >
                    <MenuItem value={false}>{t("no")}</MenuItem>
                    <MenuItem value={true}>{t("yes")}</MenuItem>
                  </Select>
                </>
              )
            }
            {
              shows("moves") && (
                <>
                  <InputLabel style={{ marginTop: 15 }}>{t('fast_move')}</InputLabel>
                  <Select
                    fullWidth
                    {...register(`fastMoves.${index}`, {
                      required: requires("moves", index),
                      validate: (value) => (
                        !requires("moves", index)
                        || pokemonOptions[pokemons[index]]?.fastMoves?.includes(value)
                      )
                    })}
                    value={watch(`fastMoves.${index}`) ?? ""}
                    variant="standard"
                  >
                    {
                      pokemons?.[index] == null
                        ? null
                        : renderFastMoves(index)
                    }
                  </Select>
                  <InputLabel style={{ marginTop: 15 }}>{t('charged_move')} 1</InputLabel>
                  <Select
                    fullWidth
                    {...register(`chargedMoves.${index}.0`, {
                      required: requires("moves", index),
                    })}
                    value={watch(`chargedMoves.${index}.0`) ?? ""}
                    variant="standard"
                  >
                    {
                      pokemons?.[index] == null
                        ? null
                        : renderChargedMoves(index)
                    }
                  </Select>
                  <InputLabel style={{ marginTop: 15 }}>{t('charged_move')} 2</InputLabel>
                  <Select
                    fullWidth
                    {...register(`chargedMoves.${index}.1`, {
                      required: requires("moves", index),
                    })}
                    value={watch(`chargedMoves.${index}.1`) ?? ""}
                    variant="standard"
                    style={{ marginBottom: 5 }}
                  >
                    <MenuItem value="None" key="None">None</MenuItem>
                    {
                      pokemons?.[index] == null
                        ? null
                        : renderChargedMoves(index)
                    }
                  </Select>
                </>
              )
            }
          </GridItem>
        </GridContainer>
      </Card>
    </GridItem>
  ))
}
