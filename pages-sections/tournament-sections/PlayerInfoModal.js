import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import React from "react";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import { useTranslation } from "react-i18next";

function PlayerInfoModal(props) {
  const { t } = useTranslation();
  const { open, data, Transition, onClose } = props;
  return(
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={onClose}
      aria-labelledby="player-modal-slide-title"
      aria-describedby="player-modal-slide-description"
    >
        <DialogTitle
          id="player-modal-slide-title"
        >
          {data?.name}
        </DialogTitle>
        <DialogContent
            id="player-modal-slide-description"
        >
            <GridContainer>
                <GridItem xs={12}>
                   <div style={{ textAlign: "center" }}>
                    <img src={data?.avatar} alt={data?.name} height={60} width={60} />
                    <p>{data?.description}</p>
                   </div>
                    <p>{t("friend_code")}: {data?.friendCode}</p>
                    {
                        data?.discord?.length > 0 && (
                            <p>Discord: {data?.discord}</p>
                        )
                    }
                    {
                        data?.telegram?.length > 0 && (
                            <p>Telegram: {data?.telegram}</p>
                        )
                    }
                </GridItem>
            </GridContainer>
        </DialogContent>
    </Dialog>
  )
}

export default PlayerInfoModal;
