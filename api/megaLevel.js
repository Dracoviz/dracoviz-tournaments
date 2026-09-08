/**
 * Mega level rules, mirroring dracoviz-site/util/megaLevel.js.
 *
 * The site owns the authoritative copy -- it is what registration is validated against -- but this
 * app cannot import from that repo, and the same species-tag rules are already mirrored across the
 * two for RETURN/FRUSTRATION (TeamBuilder.js and the site's move-selector.jsx / validation.js).
 * Keep the two in step.
 */

export const MEGA_LEVELS = ["base", "high", "max", "super_max"];

export const SUPER_MAX = "super_max";

/** Whether a dex entry from `pokemonOptions` is a Mega. */
export const isMega = (entry) => entry?.tags?.includes("mega") === true;

/**
 * Whether a Mega can reach Super Max. Gated on the plus move rather than the "supermega" tag: the
 * rule is that a Mega with a plus move can get there, and staraptor_mega carries the tag without
 * PvPoke having given it a move yet.
 */
export const canSuperMax = (entry) => isMega(entry) && entry?.plusMove != null;

/**
 * The move id to render a plus move under. The dex stores it without the suffix, but
 * api/moves.json and api/moveData.json key the "+" name and the type icon by the suffixed id.
 */
export const plusMoveId = (plusMove) => (plusMove == null ? null : `${plusMove}_PLUS`);

/** The levels a given dex entry may hold. Empty for anything that is not a Mega. */
export function megaLevelsFor(entry) {
  if (!isMega(entry)) {
    return [];
  }
  return canSuperMax(entry) ? MEGA_LEVELS : MEGA_LEVELS.filter((l) => l !== SUPER_MAX);
}
