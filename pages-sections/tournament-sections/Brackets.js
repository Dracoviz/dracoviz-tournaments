import React from "react";
import { useTranslation } from "next-i18next";
import { makeStyles } from "@mui/styles";
import styles from "/styles/jss/nextjs-material-kit/sections/bracketsStyle.js";

const useStyles = makeStyles(styles);

const exampleRound1 = {
  round: 1,
  matches: [
    { // Normal left win
      seed: 1,
      score: [[2, 0]],
      participants: [
        [
          {
            name: "Player 1"
          },
          {
            name: "Player 4"
          }
        ]
      ]
    },
    { // Normal right win
      seed: 2,
      score: [[0, 2]],
      participants: [
        [
          {
            name: "Player 2"
          },
          {
            name: "Player 3"
          }
        ]
      ]
    },
    { // Normal left win
      seed: 3,
      score: [[2, 0]],
      participants: [
        [
          {
            name: "Player 5"
          },
          {
            name: "Player 6"
          }
        ]
      ]
    },
    { // Normal left win
      seed: 4,
      score: [[1, 2]],
      participants: [
        [
          {
            name: "Player 7"
          },
          {
            name: "Player 8"
          }
        ]
      ]
    },
    { // Normal left win
      seed: 5,
      score: [[2, 1]],
      participants: [
        [
          {
            name: "Player 10"
          },
          {
            name: "Player 9"
          }
        ]
      ]
    },
  ]
}

const exampleRound4 = {
  round: 4,
  matches: [
    { // Normal right win
      seed: 1,
      score: [[0, 2]],
      participants: [
        [
          {
            name: "Player 1"
          },
          {
            name: "Player 2"
          }
        ]
      ]
    },
    { // Normal left win
      seed: 2,
      score: [[2, 0]],
      participants: [
        [
          {
            name: "Player 3"
          },
          {
            name: "Player 4"
          }
        ]
      ]
    },
    { // Incomplete
      seed: 3,
      score: [[0, 0]],
      participants: [
        [
          {
            name: "Player 5"
          },
          {
            name: "Player 6"
          }
        ]
      ]
    },
    { // Dispute
      seed: 4,
      score: [[0, 0]],
      disputed: [true],
      participants: [
        [
          {
            name: "Player 9",
          },
          {
            name: "Player 10"
          }
        ]
      ]
    },
    { // Dropped
      seed: 5,
      score: [[0, 2]],
      touched: [true],
      participants: [
        [
          {
            name: "Player 7",
            removed: true
          },
          {
            name: "Player 8"
          }
        ]
      ]
    },
  ]
}

const exampleBracket = [
  exampleRound1, {...exampleRound1, round: 2}, {...exampleRound1, round: 3}, exampleRound4
]

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
  const { match, isTeamTournament } = props;
  const { seed, score, disputed, participants, touched } = match;
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
      return (
        <div style={bracketStyle} className={classes.participant}>
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

  if (isTeamTournament) {
    // TODO: Team tourney
    return null;
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
  const { isTeamTournament } = props;
  return(
    <div
      className="scroller"
      style={{
        direction: "rtl",
        overflowX: "scroll",
        backgroundColor: "#F6F5F5"
      }}
    >
      <div className={classes.rounds} style={{ width: exampleBracket.length * 350 }}>
        {exampleBracket.map((roundObj) => {
          const { round, matches } = roundObj;
          return (
            <section className={classes.round}>
              <h3 className={classes.roundLabel}>
                {t('round_label', { round })}
              </h3>
              {
                matches.map((match) => (
                  <Match match={match} isTeamTournament={isTeamTournament} />
                ))
              }
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default Brackets;
