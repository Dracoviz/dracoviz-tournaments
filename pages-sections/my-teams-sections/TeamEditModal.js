import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { Button, TextField, Autocomplete, Alert } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import TeamBuilder from "/components/TeamBuilder/TeamBuilder.js";
import PvPokeDialog from "/components/TeamBuilder/PvPokeDialog.js";
import {
  unifiedToFormValues, formValuesToUnified, emptyFormValues, TEAM_SIZE,
} from "../../api/teamFormat";
import getMetaOptions, { getMetaLabel } from "../../api/getMetaOptions";

/**
 * Create or edit a saved team. `team` being null means create.
 *
 * There is no tournament here to say which fields matter, so everything is offered and nothing
 * about the team itself is required. An unfinished team saves and is reported back as invalid,
 * rather than being held hostage until it is complete — only a name and at least one Pokemon are
 * needed, because the API rejects a team without them.
 */
export default function TeamEditModal(props) {
  const {
    open, onClose, onSave, team, pokemonOptions, pokemonItems, isSaving,
  } = props;
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [isPvPokeOpen, setIsPvPokeOpen] = useState(false);
  const {
    register, control, watch, setValue, getValues, reset, handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    if (!open) {
      return;
    }
    reset({
      name: team?.name ?? "",
      description: team?.description ?? "",
      metas: team?.metas ?? [],
      ...(team == null
        ? emptyFormValues(TEAM_SIZE)
        : unifiedToFormValues(team.pokemon, pokemonOptions)),
    });
  }, [open, team]);

  const onSubmit = (data) => {
    onSave({
      teamId: team?.id,
      name: data.name,
      description: data.description,
      metas: data.metas ?? [],
      pokemon: formValuesToUnified(data, TEAM_SIZE, pokemonOptions),
    });
  };

  const pokemons = watch("pokemon") ?? [];
  const filledCount = pokemons.filter((p) => p != null && p !== "").length;
  const hasName = (watch("name") ?? "").trim() !== "";
  // Reported to the player rather than enforced — a team missing movesets saves fine, it just
  // cannot be used to register until it is finished.
  const missingMoves = pokemons.some((species, index) => (
    species != null && species !== ""
    && ((watch(`fastMoves.${index}`) ?? "") === ""
      || (watch(`chargedMoves.${index}.0`) ?? "") === ""
      || (watch(`chargedMoves.${index}.1`) ?? "") === "")
  ));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" scroll="body">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{team == null ? t("create_team") : t("edit_team")}</DialogTitle>
        <DialogContent>
          <GridContainer>
            <GridItem xs={12} md={6}>
              <CustomInput
                labelText={t("team_name")}
                id="team-name"
                formControlProps={{ fullWidth: true }}
                inputProps={{ ...register("name", { required: true, maxLength: 100 }) }}
                error={errors.name}
              />
            </GridItem>
            <GridItem xs={12} md={6}>
              <CustomInput
                labelText={t("team_description")}
                id="team-description"
                formControlProps={{ fullWidth: true }}
                inputProps={{ multiline: true, ...register("description", { maxLength: 500 }) }}
                error={errors.description}
              />
            </GridItem>
            <GridItem xs={12}>
              <Controller
                control={control}
                name="metas"
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    multiple
                    // Values are the rules.json keys the API validates against; only the labels
                    // are localized.
                    options={getMetaOptions(t).map((meta) => meta.value)}
                    getOptionLabel={(meta) => getMetaLabel(meta, t)}
                    value={value ?? []}
                    onChange={(_event, selected) => onChange(selected)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("team_metas")}
                        variant="standard"
                        placeholder={t("team_metas_placeholder")}
                      />
                    )}
                  />
                )}
              />
              <small>{t("team_metas_tip")}</small>
            </GridItem>
            <GridItem xs={12} style={{ marginTop: 15, marginBottom: 5 }}>
              <Button onClick={() => setIsPvPokeOpen(true)}>{t("pvpoke_title")}</Button>
            </GridItem>
            {filledCount > 0 && filledCount < TEAM_SIZE && (
              <GridItem xs={12}>
                <Alert severity="info" style={{ marginBottom: 10 }}>
                  {t("team_incomplete_warning", { count: filledCount, total: TEAM_SIZE })}
                </Alert>
              </GridItem>
            )}
            {missingMoves && (
              <GridItem xs={12}>
                <Alert severity="info" style={{ marginBottom: 10 }}>
                  {t("team_missing_moves_warning")}
                </Alert>
              </GridItem>
            )}
            <TeamBuilder
              control={control}
              register={register}
              watch={watch}
              errors={errors}
              pokemonOptions={pokemonOptions}
              pokemonItems={pokemonItems}
              teamSize={TEAM_SIZE}
              locale={locale}
              showOptional
              requirements={{ allSlots: false }}
            />
          </GridContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">{t("cancel")}</Button>
          {/* Only the API's own requirements block saving; everything else is saved as invalid. */}
          <Button
            type="submit"
            disabled={
              isSaving || !hasName || filledCount <= 0
              || errors.name != null || errors.description != null
            }
          >
            {t("save")}
          </Button>
        </DialogActions>
      </form>
      <PvPokeDialog
        open={isPvPokeOpen}
        onClose={() => setIsPvPokeOpen(false)}
        getValues={getValues}
        setValue={setValue}
        pokemonOptions={pokemonOptions}
        teamSize={TEAM_SIZE}
      />
    </Dialog>
  );
}
