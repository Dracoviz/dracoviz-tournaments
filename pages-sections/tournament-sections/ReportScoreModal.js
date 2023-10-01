import React from "react";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import { useTranslation } from 'next-i18next';
import {
  Button,
  Select,
  InputLabel,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle
} from "@mui/material";

const getGamesCount = (data) => {
    if (data == null) {
      return 0;
    }
    const { gameAmount, playAllMatches } = data;
    if (playAllMatches) {
      return gameAmount;
    }
    return gameAmount / 2 + gameAmount % 2;
  }

function ReportScoreModal(props) {
    const { data, onClose, visible, onSubmit, useNames, formProps } = props;
    const hasScore = data?.score != null && (data.score[0] + data.score[1]) > 0;
    const { t } = useTranslation();
    if (data == null || formProps == null) {
        return null;
    }
    const { register, handleSubmit, watch, formState: { isValid, isDirty, isSubmitting } } = formProps;
    const menuItems = Array.from({ length: getGamesCount(data) + 1 }, (_value, index) => index);
    return (
        <Dialog
            open={visible}
            onClose={onClose}
            aria-labelledby="report-modal-slide-title"
            aria-describedby="report-modal-slide-description"
        >
            <DialogTitle
                id="report-modal-slide-title"
            >
                {hasScore ? t("edit_score") : t("report_score")}
            </DialogTitle>
            <DialogContent
                id="report-modal-slide-description"
            >
            <form onSubmit={handleSubmit(onSubmit)}>
                <GridContainer>
                <GridItem xs={12}>
                    <InputLabel>{useNames ? data?.player1 : t("games_won_label")}</InputLabel>
                    <Select
                        fullWidth
                        style={{ backgroundColor: useNames ? 'white' : "#abf7e7" }}
                        {...register(`gamesWon`, { required: true})}
                        value={watch("gamesWon")}
                    >
                    {
                        menuItems.map((i) => (
                            <MenuItem value={i} key={i}>{i}</MenuItem>
                        ))
                    }
                    </Select>
                </GridItem>
                <GridItem xs={12} style={{ marginTop: 10, marginBottom: 10 }}>
                    <InputLabel>{useNames ? data?.player2 : t("games_lost_label")}</InputLabel>
                    <Select
                        fullWidth
                        style={{ backgroundColor: useNames ? 'white' : "#f7abab" }}
                        {...register(`gamesLost`, { required: true })}
                        value={watch("gamesLost")}
                    >
                    {
                        menuItems.map((i) => (
                            <MenuItem value={i} key={i}>{i}</MenuItem>
                        ))
                    }
                    </Select>
                </GridItem>
                <GridItem xs={12}>
                    <Button
                        type="submit"
                        disabled={!isValid || !isDirty || isSubmitting}
                        fullWidth
                    >{t("save")}</Button>
                </GridItem>
                </GridContainer>
            </form>
        </DialogContent>
    </Dialog>)
}

export default ReportScoreModal;
