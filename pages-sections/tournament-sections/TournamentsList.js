import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Button, Chip } from "@mui/material";
import Card from "../../components/Card/Card";
import styles from "/styles/jss/nextjs-material-kit/sections/singlePlayerStyle.js";
import CustomInput from "../../components/CustomInput/CustomInput.js";
import { useTranslation } from "next-i18next";
import Router from "next/router";
import getRoundLengthLabel from "../../api/getRoundLengthLabel";

const useStyles = makeStyles(styles);

export default function TournamentsList(props) {
  const { tournaments } = props;
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchedTournaments, setSearchedTournaments] = useState([]);

  useEffect(() => {
    setSearchedTournaments(tournaments);
  }, [tournaments]);

  const onSearch = (e) => {
    const targetValue = e.target.value;
    const matchingTournaments = tournaments.filter(t => t.name.toLowerCase().includes(targetValue.toLowerCase()));
    setSearchedTournaments(matchingTournaments);
  }

  const renderChips = (data) => {
    const roundLengthLabel = getRoundLengthLabel(t);
    const bracketLabels = {
      "none": "bracket_type_none",
	    "swiss": "bracket_type_swiss",
	    "roundrobin": "bracket_type_round_robin"
    }
    return (
      <div style={{ marginBottom: 10 }}>
        <Chip label={t(bracketLabels[data.bracketType ?? "none"])} style={{ marginRight: 10 }} />
        <Chip label={roundLengthLabel[data.timeControl ?? 0]} color="info" style={{ marginRight: 10 }} />
        {data.isTeamDraft && <Chip label={t("draft_mode_team")} color="secondary" style={{ marginRight: 10 }} />}
        {data.isGlobalDraft && <Chip label={t("draft_mode_global")} color="secondary" style={{ marginRight: 10 }} />}
      </div>
    );
  }

  const renderMetas = (metas) => {
    return metas?.map((m) => (
      <img src={m} height={50} width={50} style={{ marginTop: -30, objectFit: "contain" }} />
    ))
  }

  const noSearchResults = searchedTournaments == null || searchedTournaments.length <= 0;

  if (tournaments == null || tournaments.length <= 0) {
    return <p>{t('no_tournaments_found')}</p>
  }

  return (
    <div>
      <CustomInput
        labelText={t("search_tournaments")}
        id="tournaments"
        formControlProps={{
          fullWidth: true
        }}
        inputProps={{
          onChange: onSearch
        }}
      />
      {
        noSearchResults ? <p>{t('no_tournaments_in_search')}</p>
        : searchedTournaments.map((tourney) => (
          <Card>
            <div className={classes.tourneyRoot}>
              <div className={classes.metas}>
                {renderMetas(tourney.metas)}
              </div>
              <div style={{ marginLeft: 20, overflow: "hidden" }}>
                <h4>{tourney.name}</h4>
                {renderChips(tourney)}
                <p className={classes.description}>{tourney.description}</p>
                <Button onClick={() => Router.push(`/tournament/${tourney.key}`)}>
                  {t("tournament_view_information")}
                </Button> <small>{tourney.players} {t("players")}</small>
              </div>
            </div>
          </Card>
        ))
      }
    </div>
  )
}
