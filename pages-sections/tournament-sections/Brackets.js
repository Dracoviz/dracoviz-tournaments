import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { makeStyles } from "@mui/styles";
import styles from "/styles/jss/nextjs-material-kit/sections/bracketsStyle.js";
import { useTheme, Tabs, Tab } from "@mui/material";
import cleanText from "../../utils/cleanText";

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

const WINNERS = "WB";
const LOSERS = "LB";
const GRAND_FINAL = "GF";

// Groups each round's matches into display columns. A double elimination round can
// hold a winners round and a losers round at the same time, so one round becomes two
// columns — but the original round and match indices have to travel with them: those
// are what onBracketSelect sends to the report endpoint, which uses them to index
// bracket[roundIndex].matches[matchIndex] directly.
function buildColumns(bracket) {
  const columns = [];
  bracket.forEach((roundObj, roundIndex) => {
    const { round, matches } = roundObj;
    const groups = new Map();
    matches.forEach((match, matchIndex) => {
      const key = match.section == null
        ? "all"
        : `${match.section}-${match.sectionRound}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key: `${roundIndex}-${key}`,
          section: match.section ?? null,
          sectionRound: match.sectionRound ?? null,
          round,
          roundIndex,
          matches: [],
        });
      }
      groups.get(key).matches.push({ match, matchIndex });
    });
    columns.push(...groups.values());
  });
  return columns;
}

function Match(props) {
  const { match, matchIndex, roundIndex, onBracketSelect, factions, playersToLookup } = props;
  const { t } = useTranslation();
  const classes = useStyles();
  const { seed, score, disputed, participants, touched } = match;
  if (score == null) {
    return null;
  }

  if (playersToLookup != null) {
    const doesNameMatch = participants.flatMap(participantGroup =>
      participantGroup // iterate through all participants in the group
    ).find((participant) => (
      playersToLookup.some(searchStr => {
        return participant.name.toLowerCase().includes(searchStr.toLowerCase());
      })
    ));

    if (!doesNameMatch) {
      return null;
    }
  }

  const renderParticipants = (index) => {
    const scores = score[index];
    const isReported = scores != null && scores.reduce((a, b) => a+b, 0) > 0;
    const higherScore = Math.max(scores?.[0], scores?.[1]);
    return participants[index].map((participant, i) => {
      const { name, removed } = participant;
      const hasHigherScore = scores != null && higherScore === scores[i];
      const bracketStyle = isReported ? (
        hasHigherScore ? bracketStyles.win : bracketStyles.loss
      ) : bracketStyles.unreported;
      const onClick = () => {
        onBracketSelect(
          roundIndex,
          matchIndex,
          index,
        )
      }
      const participantReported = participant.score?.reduce((a, b) => a+b, 0) > 0;
      const hasUnfinalReport = !isReported && participantReported;
      return (
        <div key={`${name}-${i}`} onClick={onClick} style={bracketStyle} className={classes.participant}>
          <div style={{ textDecoration: removed ? "line-through" : "none" }}>
            {cleanText(name)} {hasUnfinalReport ? "🟢" : ""}
          </div>
          <span className={classes.score}>
            {scores?.[i] || 0}
          </span>
        </div>
      )
    })
  }

  function getFactions() {
    const player1FactionId = participants[0][0].factionId;
    const player2FactionId = participants[0][1].factionId;
    const faction1 = factions.find((f) => f.key === player1FactionId);
    const faction2 = factions.find((f) => f.key === player2FactionId);
    return `${faction1?.name ?? "none"} vs ${faction2?.name ?? "none"}`;
  }

  return (
    <div className={classes.matchRoot}>
      {(participants.length > 1) && (
        <h4>{getFactions()}</h4>
      )}
      <div className={classes.matchItem}>
        <div className={classes.seed}>
          {seed}
        </div>
        <div className={classes.participants}>
          {participants.map((_, i) => (
            <div key={i}>
              {renderParticipants(i)}
            </div>
          ))}
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
  const {
    isTeamTournament,
    factions,
    bracket, onBracketSelect, currentRoundNumber, totalRounds, e
  } = props;
  const [playersToLookup, setPlayersToLookup] = useState(null);
  const [tab, setTab] = useState(WINNERS);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    if (e == null) {
      return;
    }
    onSearch(e);
  }, [e]);

  const onSearch = (e) => {
    const targetValue = e.target.value;
    if (targetValue == null || targetValue === '') {
      return setPlayersToLookup(null);
    }
    const searchStrings = targetValue.split("&");
    setPlayersToLookup(searchStrings);
  }
  if (bracket == null) {
    return null;
  }

  const columns = buildColumns(bracket);
  // Only double elimination tags its matches with a section. Everything else keeps the
  // single flat row of rounds it has always had.
  const hasSections = columns.some((column) => column.section != null);
  // The grand final (and its reset) sit at the end of both brackets, so whichever side
  // a viewer is following, they can see how it finishes.
  const visibleColumns = hasSections
    ? columns.filter((column) => column.section === GRAND_FINAL || column.section === tab)
    : columns;

  const columnLabel = (column) => {
    const { section, sectionRound, round } = column;
    if (section === WINNERS) {
      return t("winners_round_label", { round: sectionRound });
    }
    if (section === LOSERS) {
      return t("losers_round_label", { round: sectionRound });
    }
    if (section === GRAND_FINAL) {
      return sectionRound > 1
        ? t("bracket_section_grand_final_reset")
        : t("bracket_section_grand_final");
    }
    return t("round_label", { round });
  }

  return (
    <div
      className="scroller"
      style={{
        direction: isTeamTournament ? "ltr" : "rtl",
        overflowX: "scroll",
        backgroundColor: isDark ? "#252a31" : "#F6F5F5"
      }}
    >
      <p style={{ textAlign: "center", direction: "ltr" }}>
        {`${currentRoundNumber} / ${totalRounds} ${t("rounds")}`}
      </p>
      {hasSections && (
        <div style={{ direction: "ltr" }}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            centered
            className={classes.sectionTabs}
          >
            <Tab value={WINNERS} label={t("bracket_tab_winners")} />
            <Tab value={LOSERS} label={t("bracket_tab_losers")} />
          </Tabs>
        </div>
      )}
      <div
        className={classes.rounds}
        style={{ minWidth: visibleColumns.length * (isTeamTournament ? 900 : 350) }}
      >
        {visibleColumns.map((column) => (
          <section key={column.key} className={classes.round}>
            <h3
              className={classes.roundLabel}
              // A sectioned bracket splits one round across two tabs, so mark which
              // column is the live one. Left alone for the other bracket types, where
              // the columns already read in round order.
              style={hasSections && column.round === currentRoundNumber
                ? { fontWeight: "bold" }
                : undefined}
            >
              {columnLabel(column)}
            </h3>
            {column.matches.map(({ match, matchIndex }) => (
              <Match
                key={`${column.key}-${matchIndex}`}
                match={match}
                matchIndex={matchIndex}
                roundIndex={column.roundIndex}
                isTeamTournament={isTeamTournament}
                onBracketSelect={onBracketSelect}
                playersToLookup={playersToLookup}
                factions={factions}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

export default Brackets;
