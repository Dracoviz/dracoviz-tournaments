import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import Card from "../../components/Card/Card";
import Badge from "../../components/Badge/Badge";
import styles from "/styles/jss/nextjs-material-kit/sections/tournamentListStyle.js";
import { makeStyles } from "@mui/styles";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(styles);

const badgeColor = {
  "Player": "info",
  "Host": "primary",
  "Captain": "success",
}

const statusName = {
  "POKEMON_VISIBLE": i18n.t('tournament_status_pokemon_visible'),
  "MATCHUPS_VISIBLE": i18n.t('tournament_status_matchups_visible'),
  "REGISTER_TEAM": i18n.t('tournament_status_register_team'),
  "REGISTER_ROSTER": i18n.t('tournament_status_register_roster'),
  "NOT_STARTED": i18n.t('tournament_status_not_started'),
}

const statusColor = {
  "POKEMON_VISIBLE": "success",
  "MATCHUPS_VISIBLE": "warning",
  "REGISTER_TEAM": "danger",
  "REGISTER_ROSTER": "danger",
  "NOT_STARTED": "info",
}

function TournamentList(props) {
  const { sessions } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  if (sessions == null || sessions.length <= 0) {
    return (
      <p>{t("join_some_tournaments")}</p>
    )
  }
  return (
    <div>
      {
        sessions.map((session) => {
          const { _id, name, playerValues, currentRoundNumber } = session;
          const { status, role, meta } = playerValues;
          return (
            <Card className={classes.root} key={_id}>
              <img src={meta} alt="meta" height={70} width={70} />
              <div className={classes.content}>
                <p>
                  <strong className={classes.title}>{name}</strong>
                  <Badge style={{ marginLeft: 10 }} color={badgeColor[role]}>{role}</Badge>
                  <br />
                  {t("tournament_status")} <span className={classes[statusColor[status]]}>{statusName[status]}</span>
                  <p>{t("tournament_round")} {currentRoundNumber}</p>
                </p>
                <Button
                  href={`/tournament/${_id}`}
                  color="primary"
                  style={{ marginLeft: -7 }}
                >
                  {t("visit_page")}
                </Button>
              </div>
            </Card>
          )
        })
      }
    </div>
  )
}

TournamentList.propTypes = {
  sessions: PropTypes.arrayOf(PropTypes.object),
};

export default TournamentList;
