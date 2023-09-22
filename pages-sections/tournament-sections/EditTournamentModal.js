import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import React, { useState } from "react";
import { Button, InputLabel, Select, MenuItem } from "@mui/material";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import { useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import CircularProgress from "@mui/material/CircularProgress";

function EditTournamentModal(props) {
  const { t } = useTranslation();
  const { open, data, Transition, onClose, onSave, onConclude } = props;
  const { register, handleSubmit, watch, formState: { errors, isValid, isDirty } } = useForm({
    defaultValues: {
      name: data?.name,
      description: data?.description,
      bracketLink: data?.bracketLink,
      serverInviteLink: data?.serverInviteLink,
      registrationClosed: data?.registrationClosed ? "closed" : "open",
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (data) => {
    setIsLoading(true);
    await onSave?.({
      ...data,
      registrationClosed: data.registrationClosed === "closed"
    });
    setIsLoading(false);
  }
  const onClick = () => {
    if (confirm(t("confirm_conclude"))) {
      onConclude();
    }
  }
  const isRegistrationClosed = watch("registrationClosed");
  return(
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={onClose}
      aria-labelledby="tournament-modal-slide-title"
      aria-describedby="tournament-modal-slide-description"
    >
      <DialogTitle
        id="player-modal-slide-title"
      >
        {t("edit_tournament_information_button")}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          id="player-modal-slide-description"
        >
          {isLoading ? (
            <CircularProgress />
          ) : (
            <GridContainer>
              <GridItem xs={12}>
                <CustomInput
                    labelText={t("tournament_name")}
                    id="name"
                    formControlProps={{
                    fullWidth: true
                    }}
                    inputProps={{
                    ...register("name", { required: true })
                    }}
                    error={errors.name}
                />
              </GridItem>
              <GridItem xs={12}>
                <CustomInput
                  labelText={t("tournament_description")}
                  id="description"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    multiline: true,
                    ...register("description", { required: true, maxLength: 300 })
                  }}
                  error={errors.description}
                />
              </GridItem>
              <GridItem xs={12}>
                <CustomInput
                  labelText={t("create_server_invite_link")}
                  id="serverInviteLink"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    ...register("serverInviteLink")
                  }}
                  error={errors.serverInviteLink}
                />
              </GridItem>
              <GridItem xs={12}>
                <CustomInput
                  labelText={t("tournament_bracket_link")}
                  id="bracketLink"
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    ...register("bracketLink"),
                  }}
                  error={errors.bracketLink}
                />
              </GridItem>
              <GridItem xs={12}>
                <InputLabel>{t("registration_status")}</InputLabel>
                <Select
                  fullWidth
                  {...register(`registrationClosed`)}
                  value={isRegistrationClosed}
                >
                  <MenuItem value="closed">{t("registration_closed")}</MenuItem>
                  <MenuItem value="open">{t("registration_open")}</MenuItem>
                </Select>
              </GridItem>
            </GridContainer>
          )}
          <DialogActions>
            <Button
              type="button"
              color="error"
              onClick={onClick}
            >
              {t("conclude_tournament")}
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={!isDirty || !isValid || isLoading}
              style={{ float: "left" }}
            >
              {t("save")}
            </Button>
          </DialogActions>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default EditTournamentModal;