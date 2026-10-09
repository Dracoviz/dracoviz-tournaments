// Helpers for judging whether a round is finished, from the masked bracket the client
// receives. get.js replaces playerIds with display names, so an empty slot waiting on
// an earlier round arrives as "--" and a bye arrives as "Bye".
export const PENDING_SLOT = "--";
export const BYE_SLOT = "Bye";

const participantsOf = (match) => match?.participants?.[0];

const slotNames = (match) => {
  const participants = participantsOf(match);
  if (participants == null || participants.length < 2) {
    return [];
  }
  return participants.map((participant) => participant?.name);
};

// A bye needs no report and is settled server-side regardless of its score, which
// matters when byeAward is 0 and the bye is stored as 0-0.
const isBye = (match) => slotNames(match).includes(BYE_SLOT);
const isPending = (match) => slotNames(match).includes(PENDING_SLOT);

/**
 * Does this match have a decisive winner? Mirrors resolveMatch in
 * dracoviz-site/util/bracket/promoteElimPlayers.js, which is what elimination brackets
 * require before a round can be progressed — a draw is not a result there.
 */
export function isMatchDecided(match) {
  if (slotNames(match).length < 2 || isPending(match)) {
    return false;
  }
  if (isBye(match)) {
    return true;
  }
  const score = match.score?.[0];
  return score != null && score[0] !== score[1];
}

/**
 * Has anyone entered a result at all? Swiss and round robin allow a draw to stand as a
 * final result, so there "complete" only means reported.
 */
export function isMatchReported(match) {
  if (slotNames(match).length < 2 || isPending(match)) {
    return false;
  }
  if (isBye(match) || match.touched?.[0] === true) {
    return true;
  }
  const score = match.score?.[0];
  return score != null && score.reduce((sum, value) => sum + value, 0) > 0;
}

export function matchesInRound(bracket, roundNumber, matchFilter) {
  return (bracket ?? [])
    .filter((round) => round.round === roundNumber)
    .flatMap((round) => round.matches ?? [])
    .filter((match) => matchFilter == null || matchFilter(match));
}

/**
 * How many matches in the given round still need the host's attention.
 * `requireWinner` applies the stricter elimination rule, where a draw also counts as
 * outstanding because the server refuses to promote anyone from it.
 */
export function countIncompleteMatches(bracket, roundNumber, options = {}) {
  const { requireWinner = false, matchFilter } = options;
  const isComplete = requireWinner ? isMatchDecided : isMatchReported;
  return matchesInRound(bracket, roundNumber, matchFilter)
    .filter((match) => !isComplete(match))
    .length;
}

/**
 * Can this match be played right now? Both slots filled by real players, and no result
 * yet. A slot still waiting on an earlier match, or a bye, is not playable.
 */
export function isMatchPlayable(match) {
  if (slotNames(match).length < 2 || isPending(match)) {
    return false;
  }
  return !isMatchDecided(match);
}

/**
 * How many matches are waiting to be played. Elimination brackets are not gated on a
 * round any more, so this counts across the whole bracket rather than within one round.
 */
export function countPlayableMatches(bracket, matchFilter) {
  return (bracket ?? [])
    .flatMap((round) => round.matches ?? [])
    .filter((match) => matchFilter == null || matchFilter(match))
    .filter(isMatchPlayable)
    .length;
}
