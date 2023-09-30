import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import React from "react";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import { useTranslation } from "next-i18next";
import { Button } from "@mui/material";
import Linkify from 'react-linkify';

function TournamentInfoModal(props) {
  const { t } = useTranslation();
  const { open, data, Transition, onClose } = props;
  return(
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={onClose}
      aria-labelledby="tournament-modal-slide-title"
      aria-describedby="tournament-modal-slide-description"
    >
        <DialogTitle
          id="tournament-modal-slide-title"
        >
          {data?.name}
        </DialogTitle>
        <DialogContent
            id="tournament-modal-slide-description"
        >
            <GridContainer>
                <GridItem xs={12}>
                    <Linkify>
                        <p style={{ whiteSpace: "pre-wrap" }}>{data.description}</p>
                    </Linkify>
                    <p><b>{data?.hideTeamsFromHost ? t("host_cannot_see_teams") : t("host_can_see_teams")}</b></p>
                </GridItem>
                <GridItem xs={6}>
                    <Button href={data?.bracketLink} target="_blank" fullWidth>{t("tournament_see_bracket_button")}</Button>
                </GridItem>
                <GridItem xs={6}>
                    <Button href={data?.serverInviteLink} target="_blank" fullWidth>{t("server_invite_link")}</Button>
                </GridItem>
                <GridItem xs={12}>
                    <div style={{ marginTop: 20 }}/>
                </GridItem>
                <GridItem xs={12} sm={4}>
                    <CustomInput
                        labelText={t("max_participants")}
                        id="participants"
                        formControlProps={{
                            fullWidth: true
                        }}
                        inputProps={{
                            readOnly: true,
                            value: data?.maxTeams
                        }}
                    />
                </GridItem>
                <GridItem xs={12} sm={4}>
                    <CustomInput
                        labelText={t("team_size")}
                        id="teamSize"
                        formControlProps={{
                            fullWidth: true
                        }}
                        inputProps={{
                            readOnly: true,
                            value: data?.maxTeamSize
                        }}
                    />
                </GridItem>
                <GridItem xs={12} sm={4}>
                    <CustomInput
                        labelText={t("team_size_match")}
                        id="teamSizeMatch"
                        formControlProps={{
                            fullWidth: true
                        }}
                        inputProps={{
                            readOnly: true,
                            value: data?.matchTeamSize
                        }}
                    />
                </GridItem>
            </GridContainer>
        </DialogContent>
    </Dialog>
  )
}

export default TournamentInfoModal;
