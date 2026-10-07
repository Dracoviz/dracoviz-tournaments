import { BYE_SLOT, PENDING_SLOT, isMatchDecided } from "./bracketProgress";

export const ELIM_BRACKET_TYPES = ["singleElim", "doubleElim"];
// Formats where everyone keeps playing, so a record alone decides the ranking and
// Buchholz is what separates players on the same record.
export const BUCHHOLZ_BRACKET_TYPES = ["swiss", "roundrobin"];

export function isElimBracket(bracketType) {
  return ELIM_BRACKET_TYPES.includes(bracketType);
}

export function usesBuchholz(bracketType) {
  return BUCHHOLZ_BRACKET_TYPES.includes(bracketType);
}

const isRealPlayer = (name) => (
  name != null && name !== BYE_SLOT && name !== PENDING_SLOT
);

/**
 * Who each player has been paired against, read off the bracket. get.js does not send
 * the opponent lists it keeps server-side, but it does send every pairing, so the same
 * information is already here.
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

/**
 * Standings order for the formats where everyone plays every round: match wins first,
 * then Buchholz, then games won, then name so the order is at least stable.
 */
export function getRecordOrder(bracket, players) {
  const buchholz = getBuchholzScores(bracket, players);
  return [...(players ?? [])]
    .sort((a, b) => (
      (b.wins ?? 0) - (a.wins ?? 0)
      || (buchholz.get(b.name) ?? 0) - (buchholz.get(a.name) ?? 0)
      || (b.gameWins ?? 0) - (a.gameWins ?? 0)
      || (a.name ?? "").localeCompare(b.name ?? "")
    ))
    .map((player) => player.name);
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
 */
export function isBracketComplete(bracket) {
  if (bracket == null || bracket.length === 0) {
    return false;
  }
  return bracket.every((round) => round.matches?.length > 0
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
 */
export function getElimStandings(bracket, players) {
  if (bracket == null || players == null) {
    return [];
  }
  const rounds = [...bracket].sort((a, b) => a.round - b.round);

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
 * Player display names in standings order, for sorting the player list.
 */
export function getStandingsOrder(bracket, players) {
  return getElimStandings(bracket, players).map((entry) => entry.player.name);
}
