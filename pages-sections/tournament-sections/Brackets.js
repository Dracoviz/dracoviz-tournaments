import React from "react";
import { useTranslation } from "next-i18next";
import { makeStyles } from "@mui/styles";
import styles from "/styles/jss/nextjs-material-kit/sections/bracketsStyle.js";

const useStyles = makeStyles(styles);

const bracketStyles = {
  "win": {
    color: "#34343",
    backgroundColor: "#69F37E"
  },
  "loss": {
    color: "white",
    backgroundColor: "#FF0000"
  },
  "unreported": {
    color: "#34343",
    backgroundColor: "#F2E5E5"
  }
}

function Match(props) {
  const { match, matchIndex, roundIndex, onBracketSelect, isTeamTournament } = props;
  const { seed, score, disputed, participants, touched } = match;
  if (score == null) {
    return null;
  }
  const scores = score[0];
  const { t } = useTranslation();
  const isReported = scores.reduce((a, b) => a+b, 0) > 0;
  const higherScore = Math.max(scores[0], scores[1]);
  const classes = useStyles();

  const renderParticipants = () => {
    return participants[0].map((participant, i) => {
      const { name, removed } = participant;
      const hasHigherScore = higherScore === scores[i];
      const bracketStyle = isReported ? (
        hasHigherScore ? bracketStyles.win : bracketStyles.loss
      ) : bracketStyles.unreported;
      const onClick = () => {
        onBracketSelect(
          roundIndex,
          matchIndex,
        )
      }
      return (
        <div onClick={onClick} style={bracketStyle} className={classes.participant}>
          <div style={{ textDecoration: removed ? "line-through" : "none" }}>
            {name}
          </div>
          <span className={classes.score}>
            {scores[i]}
          </span>
        </div>
      )
    })
  }

  return (
    <div className={classes.matchRoot}>
      <div className={classes.matchItem}>
        <div className={classes.seed}>
          {seed}
        </div>
        <div>
          {renderParticipants()}
        </div>
      </div>
      <small>
        {disputed?.[0] && t("disputed_note")}
        {touched?.[0] && t("touched_note")}
      </small>
    </div>
  )
}

function Brackets(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { isTeamTournament, bracket, onBracketSelect, currentRoundNumber, totalRounds } = props;
  if (bracket == null || isTeamTournament) {
    return null;
  }
  return(
    <div
      className="scroller"
      style={{
        direction: "rtl",
        overflowX: "scroll",
        backgroundColor: "#F6F5F5"
      }}
    >
      <div className={classes.rounds} style={{ minWidth: bracket.length * 350 }}>
        {bracket.map((roundObj, roundIndex) => {
          const { round, matches } = roundObj;
          return (
            <section className={classes.round}>
              <h3 className={classes.roundLabel}>
                {t('round_label', { round })}
              </h3>
              {
                matches.map((match, matchIndex) => (
                  <Match
                    match={match}
                    matchIndex={matchIndex}
                    roundIndex={roundIndex}
                    isTeamTournament={isTeamTournament}
                    onBracketSelect={onBracketSelect}
                  />
                ))
              }
            </section>
          )
        })}
      </div>
      <p style={{ textAlign: "center", direction: "ltr" }}>
        {`${currentRoundNumber} / ${totalRounds} ${t("rounds")}`}
      </p>
    </div>
  )
}

export default Brackets;
