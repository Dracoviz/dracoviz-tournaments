import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import Card from "../../components/Card/Card";
import Badge from "../../components/Badge/Badge";
import styles from "/styles/jss/nextjs-material-kit/sections/tournamentListStyle.js";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(styles);

const badgeColor = {
  "Player": "info",
  "Host": "primary",
  "Captain": "success",
}

const statusName = {
  "POKEMON_VISIBLE": "Teams revealed",
  "MATCHUPS_VISIBLE": "Matchups revealed",
  "REGISTER_TEAM": "Register your team",
  "REGISTER_ROSTER": "Complete roster registration",
  "NOT_STARTED": "Not started",
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

  if (sessions == null || sessions.length <= 0) {
    return (
      <p>You are not in any tournaments yet. Join some! 😊</p>
    )
  }
  return (
    <div>
      {
        sessions.map((session) => {
          const { _id, name, playerValues } = session;
          const { status, role, meta } = playerValues;
          return (
            <Card className={classes.root} key={_id}>
              <img src={meta} alt="meta" height={70} width={70} />
              <div className={classes.content}>
                <p>
                  <strong className={classes.title}>{name}</strong>
                  <Badge style={{ marginLeft: 10 }} color={badgeColor[role]}>{role}</Badge>
                  <br />
                  Status: <span className={classes[statusColor[status]]}>{statusName[status]}</span>
                </p>
                <Button
                  href={`/tournament/${_id}`}
                  color="primary"
                  style={{ marginLeft: -7 }}
                >
                  Visit Page
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
