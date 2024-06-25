import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import React from "react";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import QRCode from "react-qr-code";
import { useTranslation } from "next-i18next";

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
                    <img src={data?.avatar} alt={data?.name} height={60} width={60} style={{ objectFit: "contain" }} />
                    <p>{data?.description}</p>
                   </div>
                  <div style={{ border: "solid 1px lightgray", padding: "0 10px", borderRadius: 5 }}>
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
                    {
                      data?.friendCode?.length > 0 && (
                        <>
                          <p>{t("friend_code")}: {data?.friendCode}</p>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ height: "auto", margin: "0 auto", maxWidth: 64, width: "100%" }}>
                              <QRCode
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={data?.friendCode}
                                viewBox={`0 0 256 256`}
                              />
                            </div>
                            <small>{t('scan_qr')}</small>
                          </div>
                        </>
                      )
                    }
                  </div>
                </GridItem>
            </GridContainer>
        </DialogContent>
    </Dialog>
  )
}

export default PlayerInfoModal;
