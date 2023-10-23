import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import React, { useEffect, useState } from "react";
import { Button, Select, InputLabel, MenuItem } from "@mui/material";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import { useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import CircularProgress from "@mui/material/CircularProgress";

function ProfileEditModal(props) {
  const { t } = useTranslation();
  const { open, onClose, onSave, player, Transition } = props;
  const { register, handleSubmit, watch, setValue, formState: { errors, isDirty, isValid } } = useForm({
    defaultValues: {
      name: player?.name,
      friendCode: player?.friendCode,
      description: player?.description,
      discord: player?.discord,
      telegram: player?.telegram,
      avatar: player?.avatarKey,
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (data) => {
    setIsLoading(true);
    await onSave?.(data);
    setIsLoading(false);
  }
  useEffect(() => {
    if (player?.avatarKey != null) {
      setValue("avatar", player.avatarKey);
    }
  }, [player?.avatarKey])
  const avatarOptions = player?.avatars == null ? null : Object.keys(player?.avatars)
  const theAvatar = watch(`avatar`);
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
          {t("edit_profile")}
        </DialogTitle>
        {
          isLoading ? (
            <CircularProgress />
          ) : (
            <DialogContent
              id="profile-modal-slide-description"
            >
              <GridContainer>
                <GridItem xs={12}>
                  <CustomInput
                    labelText={t("trainer_name")}
                    id="name"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      ...register("name", { required: true }),
                      defaultValue: player?.name
                    }}
                    error={errors.trainerName}
                  />
                </GridItem>
                <GridItem xs={12}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 20
                  }}>
                    <div style={{ width: "100%", marginRight: 20 }}>
                      <InputLabel>{t("avatar")}</InputLabel>
                      <Select
                        fullWidth
                        {...register(`avatar`, { required: true })}
                        value={theAvatar}
                      >
                        {
                          avatarOptions?.map((a, index) => (
                            <MenuItem value={a} key={index}>
                              {player?.avatars[a]?.name}
                            </MenuItem>
                          ))
                        }
                      </Select>
                    </div>
                    <img
                      src={player?.avatars[theAvatar]?.src}
                      alt={player?.avatars[theAvatar]?.name}
                      width={100}
                      height={80}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </GridItem>
                <GridItem xs={12} sm={6}>
                  <CustomInput
                    labelText={t("friend_code")}
                    id="friendCode"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      ...register("friendCode"),
                      defaultValue: player?.friendCode
                    }}
                    error={errors.friendCode}
                  />
                </GridItem>
                <GridItem xs={12}>
                  <CustomInput
                    labelText={t("trainer_bio")}
                    id="description"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      ...register("description", { maxLength: 100 }),
                      defaultValue: player?.description
                    }}
                  />
                </GridItem>
                <GridItem xs={12}>
                  <CustomInput
                    labelText="Discord"
                    id="discord"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      ...register("discord", { maxLength: 100 }),
                      defaultValue: player?.discord
                    }}
                  />
                </GridItem>
                <GridItem xs={12}>
                  <CustomInput
                    labelText="Telegram"
                    id="telegram"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      ...register("telegram", { maxLength: 100 }),
                      defaultValue: player?.telegram
                    }}
                  />
                </GridItem>
                <GridItem xs={12}>
                  <small>
                    {t("name_and_code_must_match")}
                    <br />
                    {t("additional_profile_options")}
                  </small>
                </GridItem>
              </GridContainer>
            </DialogContent>
          )
        }
        <DialogActions>
          <Button
            type="submit"
            color="primary"
            disabled={!isDirty || !isValid || isLoading}
          >
            {t("save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ProfileEditModal;
