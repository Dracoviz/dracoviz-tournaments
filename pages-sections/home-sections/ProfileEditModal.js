import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import React, { useState } from "react";
import { Button } from "@mui/material";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import { useForm } from "react-hook-form";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";

function ProfileEditModal(props) {
  const { t } = useTranslation();
  const { open, onClose, onSave, player, Transition } = props;
  const { register, handleSubmit, formState: { errors, isDirty, isValid } } = useForm({
    defaultValues: {
      trainerName: player?.name,
      friendCode: player?.friendCode,
      trainerBio: player?.description,
    }
  });
  const onSubmit = () => {
    onSave?.();
  }
  return(
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={onClose}
      aria-labelledby="profile-modal-slide-title"
      aria-describedby="profile-modal-slide-description"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle
          id="profile-modal-slide-title"
        >
          Edit Profile
        </DialogTitle>
        <DialogContent
          id="profile-modal-slide-description"
        >
          <GridContainer>
            <GridItem xs={12} sm={6}>
              <CustomInput
                labelText="Trainer Name*"
                id="trainerName"
                formControlProps={{
                  fullWidth: true
                }}
                inputProps={{
                  ...register("trainerName", { required: true }),
                  defaultValue: player?.name
                }}
                error={errors.trainerName}
              />
            </GridItem>
            <GridItem xs={12} sm={6}>
              <CustomInput
                labelText="Friend Code*"
                id="friendCode"
                formControlProps={{
                  fullWidth: true
                }}
                inputProps={{
                  ...register("friendCode", { required: true, maxLength: 12 }),
                  defaultValue: player?.friendCode
                }}
                error={errors.friendCode}
              />
            </GridItem>
            <GridItem xs={12}>
              <CustomInput
                labelText="Bio"
                id="trainerBio"
                formControlProps={{
                  fullWidth: true
                }}
                inputProps={{
                  ...register("trainerBio", { maxLength: 100 }),
                  defaultValue: player?.description
                }}
              />
            </GridItem>
            <GridItem xs={12}>
              <small>
                *Your name and code must match Pokémon GO
                <br />
                Additional profile options will come in future updates
              </small>
            </GridItem>
          </GridContainer>
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            color="primary"
            disabled={!isDirty || !isValid}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ProfileEditModal;
