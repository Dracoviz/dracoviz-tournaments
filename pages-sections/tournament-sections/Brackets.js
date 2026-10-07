import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { makeStyles } from "@mui/styles";
import styles from "/styles/jss/nextjs-material-kit/sections/bracketsStyle.js";
import { useTheme, Tabs, Tab, Chip, Tooltip } from "@mui/material";
import cleanText from "../../utils/cleanText";
import { countIncompleteMatches } from "../../utils/bracketProgress";
import {
  isBracketComplete, isElimBracket, usesBuchholz, getStandings,
} from "../../utils/bracketStandings";

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
// Tabs that are not bracket sections: the whole bracket for formats without sides, and
// the final placements once every match has been played.
const BRACKET = "BRACKET";
const STANDINGS = "STANDINGS";

// The grand final belongs to both sides of the bracket, so it shows on either tab.
// Takes anything carrying a `section` — a match or one of the columns built below.
const inTab = (tab) => ({ section }) => (
  section === GRAND_FINAL || section === tab
);

const tabStorageKey = (tournamentId) => (
  `dracoviz.bracketTab.${tournamentId ?? "default"}`
);

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
    bracket, onBracketSelect, currentRoundNumber, totalRounds, e, isHost, tournamentId,
    bracketType, players
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

  // Restore the last tab the host was on. This has to happen after mount rather than in
  // the initial state: the page is server-rendered, where localStorage does not exist,
  // and seeding state from it would break hydration.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(tabStorageKey(tournamentId));
      if (saved === WINNERS || saved === LOSERS) {
        setTab(saved);
      }
    } catch {
      // Private browsing or blocked site data. The default tab is fine.
    }
  }, [tournamentId]);

  const onTabChange = (_, value) => {
    setTab(value);
    try {
      localStorage.setItem(tabStorageKey(tournamentId), value);
    } catch {
      // Not being able to remember the tab should never break switching it.
    }
  }

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
  // Elimination placements only mean anything once the bracket has been played out
  // (concluding is separate). Swiss and round robin standings are useful from the
  // first round onward, which is the whole point of them — but records only exist
  // once something has been reported, so there is nothing to rank before then.
  const hasRecords = (players ?? []).some((player) => player.wins != null);
  const showStandings = isElimBracket(bracketType)
    ? isBracketComplete(bracket)
    : (usesBuchholz(bracketType) && hasRecords);
  const tabs = [];
  if (hasSections) {
    tabs.push({ value: WINNERS, label: t("bracket_tab_winners"), section: WINNERS });
    tabs.push({ value: LOSERS, label: t("bracket_tab_losers"), section: LOSERS });
  } else if (showStandings) {
    // Single elimination has no sides, so it only needs a tab bar once there is a
    // second thing to show.
    tabs.push({ value: BRACKET, label: t("bracket_tab_bracket") });
  }
  if (showStandings) {
    tabs.push({ value: STANDINGS, label: t("bracket_tab_standings") });
  }
  // The remembered tab may not exist here — a losers tab carried over to a single
  // elimination bracket, say — so fall back to the first one available.
  const activeTab = tabs.some((entry) => entry.value === tab)
    ? tab
    : (tabs[0]?.value ?? WINNERS);

  const visibleColumns = hasSections ? columns.filter(inTab(activeTab)) : columns;

  // Per-side progress for the round being played, so a host can see at a glance which
  // bracket is holding things up. Elimination needs a decisive winner, not just a report.
  const sectionStatus = (section) => {
    const matchFilter = inTab(section);
    const total = columns
      .filter((column) => column.round === currentRoundNumber)
      .filter(matchFilter)
      .reduce((sum, column) => sum + column.matches.length, 0);
    const incomplete = countIncompleteMatches(bracket, currentRoundNumber, {
      requireWinner: true,
      matchFilter,
    });
    return { total, incomplete };
  }

  const tabLabel = (label, section) => {
    if (!isHost) {
      return label;
    }
    const { total, incomplete } = sectionStatus(section);
    // This side has nothing scheduled this round — say nothing rather than imply it is done.
    if (total === 0) {
      return label;
    }
    return (
      <span className={classes.tabLabel}>
        {label}
        {incomplete > 0 ? (
          <Chip
            size="small"
            color="error"
            label={incomplete}
            title={t("bracket_matches_remaining", { count: incomplete })}
            className={classes.tabChip}
          />
        ) : (
          <span
            className={classes.tabReady}
            title={t("bracket_ready_to_progress")}
            aria-label={t("bracket_ready_to_progress")}
          >
            ✓
          </span>
        )}
      </span>
    );
  }

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

  const renderStandings = () => {
    const standings = getStandings(bracket, players, bracketType);
    if (standings.length === 0) {
      return null;
    }
    const hasBuchholz = standings.some((entry) => entry.buchholz != null);
    return (
      <div className={classes.standings}>
        {hasBuchholz && (
          <div className={`${classes.standingsRow} ${classes.standingsHeader}`}>
            <span className={classes.standingsPlace} />
            <span className={classes.standingsName} />
            <span className={classes.standingsRecord}>{t("standings_record")}</span>
            <Tooltip title={t("buchholz_tooltip")} enterTouchDelay={0} arrow>
              <span className={classes.standingsBuchholz}>{t("buchholz_short")}</span>
            </Tooltip>
          </div>
        )}
        {standings.map(({ player, placement, buchholz }) => {
          const { name, removed, wins, losses, gameWins, gameLosses } = player;
          return (
            <div key={name} className={classes.standingsRow}>
              <span className={classes.standingsPlace}>
                {/* A player who did not finish an elimination bracket has no placing. */}
                {placement == null ? "–" : `#${placement}`}
              </span>
              <span
                className={classes.standingsName}
                style={{ textDecoration: removed ? "line-through" : "none" }}
              >
                {cleanText(name)}
              </span>
              <span className={classes.standingsRecord}>
                {wins == null ? "" : t("winLoss", { wins, losses, gameWins, gameLosses })}
              </span>
              {hasBuchholz && (
                <span className={classes.standingsBuchholz}>{buchholz}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: isDark ? "#252a31" : "#F6F5F5" }}>
      {/* The round counter and tabs live outside the scrolling area on purpose. Inside
          it they are laid out against the full bracket width, so they drift off-centre
          and scroll away as soon as the bracket is wider than the screen. */}
      <p style={{ textAlign: "center" }}>
        {`${currentRoundNumber} / ${totalRounds} ${t("rounds")}`}
      </p>
      {tabs.length > 1 && (
        <Tabs
          value={activeTab}
          onChange={onTabChange}
          centered
          className={classes.sectionTabs}
        >
          {tabs.map((entry) => (
            <Tab
              key={entry.value}
              value={entry.value}
              label={entry.section == null
                ? entry.label
                : tabLabel(entry.label, entry.section)}
            />
          ))}
        </Tabs>
      )}
      {activeTab === STANDINGS ? renderStandings() : (
      <div
        className="scroller"
        style={{
          direction: isTeamTournament ? "ltr" : "rtl",
          overflowX: "scroll",
        }}
      >
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
      )}
    </div>
  )
}

export default Brackets;
