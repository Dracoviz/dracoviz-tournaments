import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import React, { useState } from "react";
import { Button } from "@material-ui/core";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import { useForm } from "react-hook-form";

function ProfileEditModal(props) {
  const { open, onClose, onSave, player, Transition } = props;
  const { register, handleSubmit, formState: { errors, isDirty, isValid } } = useForm();
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
                  defaultValue: player.name,
                  ...register("trainerName", { required: true })
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
                  defaultValue: player.friendCode,
                  ...register("friendCode", { required: true, maxLength: 12 })
                }}
                error={errors.friendCode}
              />
            </GridItem>
            <GridItem xs={12}>
              <CustomInput
                labelText="Motto"
                id="trainerMotto"
                formControlProps={{
                  fullWidth: true
                }}
                inputProps={{
                  defaultValue: player.description,
                  ...register("trainerDescription", { maxLength: 100 })
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
            disable={!isDirty || !isValid}
          >
            Save
          </Button>
          <Button
            onClick={onClose}
            color="danger"
            simple
          >
            Close
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ProfileEditModal;
