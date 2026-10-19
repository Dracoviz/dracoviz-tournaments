/**
 * Mega level rules, mirroring dracoviz-site/util/megaLevel.js.
 *
 * The site owns the authoritative copy -- it is what registration is validated against -- but this
 * app cannot import from that repo, and the same species-tag rules are already mirrored across the
 * two for RETURN/FRUSTRATION (TeamBuilder.js and the site's move-selector.jsx / validation.js).
 * Keep the two in step.
 */

export const MEGA_LEVELS = ["base", "high", "max", "super_max"];

/** Whether a dex entry from `pokemonOptions` is a Mega. */
export const isMega = (entry) => entry?.tags?.includes("mega") === true;

/**
 * The move id to render a plus move under. The dex stores it without the suffix, but
 * api/moves.json and api/moveData.json key the "+" name and the type icon by the suffixed id.
 */
export const plusMoveId = (plusMove) => (plusMove == null ? null : `${plusMove}_PLUS`);

/**
 * The levels a given dex entry may hold: all four for any Mega, none for anything else. A plus
 * move does not gate the ladder -- it is a property of the species, available at every level.
 */
export function megaLevelsFor(entry) {
  return isMega(entry) ? MEGA_LEVELS : [];
}
