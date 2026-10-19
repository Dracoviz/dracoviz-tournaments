import {
  BYE_SLOT, PENDING_SLOT, isMatchDecided, isMatchReported,
} from "./bracketProgress";

export const ELIM_BRACKET_TYPES = ["singleElim", "doubleElim"];
// A swiss stage that cuts into a double elimination bracket. Neither of the two groups
// above on its own: it is paired a round at a time like swiss, then played out like an
// elimination bracket, and its standings have to account for both.
export const HYBRID_BRACKET_TYPE = "swissDoubleElim";
// Formats where everyone keeps playing, so a record alone decides the ranking and
// Buchholz is what separates players on the same record. The hybrid belongs here because
// its swiss stage is exactly that, and because Buchholz remains the tiebreak that decided
// who was cut.
export const BUCHHOLZ_BRACKET_TYPES = ["swiss", "roundrobin", HYBRID_BRACKET_TYPE];

// Sections a double elimination bracket tags its matches with, which is also what marks
// out the top cut rounds of a hybrid bracket from the swiss rounds before them.
const CUT_SECTIONS = ["WB", "LB", "GF"];

export function isElimBracket(bracketType) {
  return ELIM_BRACKET_TYPES.includes(bracketType);
}

export function isHybridBracket(bracketType) {
  return bracketType === HYBRID_BRACKET_TYPE;
}

export function usesBuchholz(bracketType) {
  return BUCHHOLZ_BRACKET_TYPES.includes(bracketType);
}

export function isCutRound(round) {
  return (round?.matches ?? []).some((match) => CUT_SECTIONS.includes(match.section));
}

export function getCutRounds(bracket) {
  return (bracket ?? []).filter(isCutRound);
}

/**
 * The rounds before the cut. For a pure elimination bracket this is empty, and for swiss
 * or round robin it is everything — in both cases the callers below leave it alone.
 */
export function getSwissRounds(bracket) {
  return (bracket ?? []).filter((round) => !isCutRound(round));
}

/**
 * Has the top cut been drawn? True for a pure double elimination bracket as well, where
 * every round is a cut round — which is what keeps the helpers below behaving exactly as
 * they did for that format.
 */
export function hasCut(bracket) {
  return getCutRounds(bracket).length > 0;
}

const isRealPlayer = (name) => (
  name != null && name !== BYE_SLOT && name !== PENDING_SLOT
);

/**
 * Who each player has actually played, read off the bracket. get.js does not send the
 * opponent lists it keeps server-side, but it does send every pairing, so the same
 * information is already here.
 *
 * Only matches with a result count. The current round's pairings are sent to the client
 * as soon as they are generated, and counting an opponent nobody has played yet does
 * not just add noise — it systematically flattens the figure. In round 2 of a swiss
 * event every winner is paired against another winner and every loser against another
 * loser, so including that round hands all 44 players a Buchholz of exactly 1.
 *
 * A draw still counts: it is a played game, and swiss allows it as a final result,
 * which is why this tests for "reported" rather than "has a winner".
 *
 * A rematch counts twice, which is what summing opponents' scores means. Byes
 * contribute no opponent at all.
 */
export function getOpponentNames(bracket) {
  const opponents = new Map();
  const add = (player, opponent) => {
    if (!isRealPlayer(player) || !isRealPlayer(opponent)) {
      return;
    }
    if (!opponents.has(player)) {
      opponents.set(player, []);
    }
    opponents.get(player).push(opponent);
  };
  (bracket ?? []).forEach((round) => {
    (round.matches ?? []).forEach((match) => {
      if (!isMatchReported(match)) {
        return;
      }
      (match.participants ?? []).forEach((group) => {
        if (group == null || group.length < 2) {
          return;
        }
        const [first, second] = group.map((participant) => participant?.name);
        add(first, second);
        add(second, first);
      });
    });
  });
  return opponents;
}

/**
 * Buchholz: the combined match wins of everyone a player has faced. Two players on the
 * same record are separated by who had the harder schedule.
 *
 * Returns a Map of display name to score.
 */
export function getBuchholzScores(bracket, players) {
  const winsByName = new Map((players ?? []).map((p) => [p.name, p.wins ?? 0]));
  const opponents = getOpponentNames(bracket);
  const scores = new Map();
  (players ?? []).forEach((player) => {
    const faced = opponents.get(player.name) ?? [];
    scores.set(
      player.name,
      faced.reduce((sum, name) => sum + (winsByName.get(name) ?? 0), 0),
    );
  });
  return scores;
}

// Match wins first, then Buchholz, then games won, then name so the order is stable.
const recordComparator = (buchholz) => (a, b) => (
  (b.wins ?? 0) - (a.wins ?? 0)
  || (buchholz.get(b.name) ?? 0) - (buchholz.get(a.name) ?? 0)
  || (b.gameWins ?? 0) - (a.gameWins ?? 0)
  || (a.name ?? "").localeCompare(b.name ?? "")
);

/**
 * Standings for the formats where everyone keeps playing. Unlike an elimination
 * bracket these are meaningful from the first round onward, and every player holds a
 * record — including anyone who has dropped out — so everybody gets a placement.
 *
 * `scores` lets a caller hand in Buchholz figures it has already worked out. The hybrid
 * ranks a subset of the field — the players who missed the cut — and their Buchholz has
 * to be measured against the whole field, not against each other.
 */
export function getRecordStandings(bracket, players, scores = null) {
  const buchholz = scores ?? getBuchholzScores(bracket, players);
  const sorted = [...(players ?? [])].sort(recordComparator(buchholz));

  let placement = 0;
  let previous = null;
  return sorted.map((player, index) => {
    // Players level on every tiebreak genuinely share a place.
    const key = [
      player.wins ?? 0,
      buchholz.get(player.name) ?? 0,
      player.gameWins ?? 0,
    ].join("|");
    if (key !== previous) {
      placement = index + 1;
      previous = key;
    }
    return { player, placement, buchholz: buchholz.get(player.name) ?? 0 };
  });
}

export function getRecordOrder(bracket, players) {
  return getRecordStandings(bracket, players).map((entry) => entry.player.name);
}

/**
 * Buchholz as it should be read for this format.
 *
 * For the hybrid that means the swiss schedule only. The cut is seeded off the swiss
 * standings, so this is the figure players were ranked by, and counting cut opponents
 * afterwards would move the number out from under the seeding it explains. (An
 * opponent's win total does grow as they win in the cut, so the figure is not frozen —
 * it stays a strength-of-schedule tiebreak rather than a record of the seeding.)
 */
export function getBuchholzFor(bracket, players, bracketType) {
  const rounds = isHybridBracket(bracketType) ? getSwissRounds(bracket) : bracket;
  return getBuchholzScores(rounds, players);
}

/**
 * Display names of everyone who made the top cut, read off the cut rounds.
 */
export function getCutPlayerNames(bracket) {
  const names = new Set();
  getCutRounds(bracket).forEach((round) => {
    (round.matches ?? []).forEach((match) => {
      (match.participants ?? []).forEach((group) => {
        (group ?? []).forEach((participant) => {
          if (isRealPlayer(participant?.name)) {
            names.add(participant.name);
          }
        });
      });
    });
  });
  return names;
}

/**
 * Standings for a swiss stage that cuts into a double elimination bracket.
 *
 * Before the cut these are ordinary swiss standings. After it the field splits: everyone
 * who was cut is placed by how far they got in the bracket, and everyone who was not
 * finished behind all of them, in the swiss order that decided it. So a 19-player cut
 * places 1st through 19th, and the best player who missed it is 20th.
 *
 * Withdrawn players have no placement and sit at the bottom, which is what the
 * elimination standings already do.
 */
export function getHybridStandings(bracket, players) {
  if (!hasCut(bracket)) {
    return getRecordStandings(bracket, players);
  }
  const scores = getBuchholzScores(getSwissRounds(bracket), players);
  const qualified = getCutPlayerNames(bracket);
  const active = (players ?? []).filter((player) => !player.removed);
  const inCut = active.filter((player) => qualified.has(player.name));
  const missedCut = active.filter((player) => !qualified.has(player.name));

  const cutStandings = getElimStandings(bracket, inCut)
    .map((entry) => ({ ...entry, buchholz: scores.get(entry.player.name) ?? 0 }));
  const swissStandings = getRecordStandings(bracket, missedCut, scores)
    .map((entry) => ({ ...entry, placement: entry.placement + inCut.length }));
  const withdrawn = (players ?? [])
    .filter((player) => player.removed)
    .map((player) => ({
      player,
      placement: null,
      buchholz: scores.get(player.name) ?? 0,
    }));

  return [...cutStandings, ...swissStandings, ...withdrawn];
}

/**
 * Standings for whichever format this is, or an empty list when there are none to show
 * yet. Elimination placements only exist once the bracket has been played out;
 * record-based standings exist as soon as a round has been played.
 */
export function getStandings(bracket, players, bracketType) {
  if (isElimBracket(bracketType)) {
    return isBracketComplete(bracket) ? getElimStandings(bracket, players) : [];
  }
  // Checked before usesBuchholz, which the hybrid is also a member of: its swiss stage
  // standings are record-based, but once the cut is drawn placement takes over.
  if (isHybridBracket(bracketType)) {
    return getHybridStandings(bracket, players);
  }
  if (usesBuchholz(bracketType)) {
    return getRecordStandings(bracket, players);
  }
  return [];
}

/**
 * Who won and who lost, by display name. Returns null if the match has no result yet,
 * and a null loser for a bye, since nobody was knocked out by it.
 */
export function getMatchResult(match) {
  if (!isMatchDecided(match)) {
    return null;
  }
  const names = match.participants[0].map((participant) => participant?.name);
  const byeIndex = names.indexOf(BYE_SLOT);
  if (byeIndex !== -1) {
    const winner = names[1 - byeIndex];
    // A match of two byes (possible in the losers bracket) advances nobody.
    return winner === BYE_SLOT ? null : { winner, loser: null };
  }
  const score = match.score?.[0];
  const winnerIndex = score[0] > score[1] ? 0 : 1;
  return { winner: names[winnerIndex], loser: names[1 - winnerIndex] };
}

/**
 * Has every match that will be played got a result?
 *
 * get.js only sends rounds up to totalRounds, so the grand final reset is absent
 * unless it is actually required — meaning "every match the client can see is decided"
 * is the same thing as the bracket being finished. Being finished is independent of
 * the host having concluded the tournament.
 *
 * Only the cut rounds are asked, when the bracket has any. For a pure double elimination
 * bracket that is every round, so nothing changes there; for a hybrid it skips the swiss
 * stage, where a draw is a perfectly good final result but reads as undecided here — one
 * drawn swiss match would otherwise mean the event could never be finished.
 */
export function isBracketComplete(bracket) {
  if (bracket == null || bracket.length === 0) {
    return false;
  }
  const rounds = hasCut(bracket) ? getCutRounds(bracket) : bracket;
  return rounds.length > 0 && rounds.every((round) => round.matches?.length > 0
    && round.matches.every(isMatchDecided));
}

/**
 * Final placements for an elimination bracket.
 *
 * Placement is decided by how long you lasted, not by record: the champion is first,
 * then players in reverse order of the round they were knocked out in. Everyone
 * eliminated in the same round shares a placement and the next band skips accordingly,
 * so an 8-player bracket reads 1st, 2nd, 3rd, 4th, 5th, 5th, 7th, 7th.
 *
 * Ties inside a band are ordered by record purely for display; they keep the same
 * placement number.
 *
 * Reads only the cut rounds when the bracket has any, so a hybrid's swiss losses are not
 * mistaken for eliminations — over the whole bracket, the first swiss loss would knock
 * nearly everybody out. A pure elimination bracket is all cut rounds (single elimination
 * tags no sections at all), so this is the same calculation it always was.
 */
export function getElimStandings(bracket, players) {
  if (bracket == null || players == null) {
    return [];
  }
  const rounds = (hasCut(bracket) ? getCutRounds(bracket) : [...bracket])
    .slice()
    .sort((a, b) => a.round - b.round);

  // The champion wins the last match played — the grand final, or its reset.
  const finalRound = rounds[rounds.length - 1];
  const champion = (finalRound?.matches ?? [])
    .map(getMatchResult)
    .find((result) => result != null)?.winner ?? null;

  // A player's last loss is the one that knocked them out: single elimination allows
  // one, double elimination two.
  const eliminatedIn = new Map();
  rounds.forEach((round) => {
    (round.matches ?? []).forEach((match) => {
      const result = getMatchResult(match);
      if (result?.loser != null) {
        eliminatedIn.set(result.loser, round.round);
      }
    });
  });

  const rankOf = (player) => {
    if (player.name === champion) {
      return Infinity;
    }
    // Never played, or never lost but isn't the champion: nothing to rank them on.
    return eliminatedIn.get(player.name) ?? -1;
  };

  const ranked = players
    .filter((player) => !player.removed)
    .map((player) => ({ player, lastedUntil: rankOf(player) }))
    .sort((a, b) => (
      b.lastedUntil - a.lastedUntil
      || (b.player.wins ?? 0) - (a.player.wins ?? 0)
      || (b.player.gameWins ?? 0) - (a.player.gameWins ?? 0)
      || (a.player.name ?? "").localeCompare(b.player.name ?? "")
    ));

  let placement = 0;
  let previous = null;
  const standings = ranked.map((entry, index) => {
    if (entry.lastedUntil !== previous) {
      placement = index + 1;
      previous = entry.lastedUntil;
    }
    return { ...entry, placement };
  });

  // Withdrawn players have no placement; they sit at the bottom of the list.
  const withdrawn = players
    .filter((player) => player.removed)
    .map((player) => ({ player, lastedUntil: -1, placement: null }));

  return [...standings, ...withdrawn];
}

/**
 * Player display names in standings order, for sorting the player list. Empty when this
 * format has no standings to show yet, which is the caller's signal to fall back to its
 * own ordering.
 */
export function getStandingsOrder(bracket, players, bracketType) {
  return getStandings(bracket, players, bracketType).map((entry) => entry.player.name);
}
