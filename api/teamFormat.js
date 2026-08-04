import { sessionTeamToUnified, unifiedToSessionTeam } from "pvpoke-converter";

/**
 * Bridges the three team shapes this app deals with:
 *
 *  - form values   parallel arrays keyed by slot (`pokemon.0`, `chargedMoves.0.1`, ...), which is
 *                  what react-hook-form holds and what `session/register` accepts.
 *  - session team  `DracovizSessionPokemon[]`, the shape stored on a tournament.
 *  - universal     `UnifiedPokemon[]`, the shape saved teams are stored in and the shape
 *                  pvpoke-converter serializes to and from PvPoke.
 *
 * Conversion between the last two comes from pvpoke-converter; only the form shape is local.
 */

export const TEAM_SIZE = 6;

const SHADOW_SUFFIX = "_shadow";

function toNumber(value) {
  if (value == null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// MUI Selects hand back real booleans, but hidden inputs and query strings hand back strings.
function toBoolean(value) {
  return value === true || value === "true";
}

function toText(value) {
  return value == null || value === "" ? undefined : String(value);
}

/**
 * Species PvPoke names differently from the dex, mapped to the dex ids they could mean.
 *
 * PvPoke has no entry for dracoviz's cosmetic forms, so anything exported for PvPoke says
 * "gastrodon" where the dex only knows "gastrodon_west_sea". The listed alternatives are
 * cosmetically identical — same stats, same moves — so the first one the dex actually has is as
 * good as any other.
 */
const PVPOKE_SPECIES_FALLBACKS = {
  gastrodon: ["gastrodon_west_sea", "gastrodon_east_sea"],
  shellos: ["shellos_west_sea", "shellos_east_sea"],
  dudunsparce: ["dudunsparce_two", "dudunsparce_three"],
  squawkabilly: [
    "squawkabilly_green", "squawkabilly_blue", "squawkabilly_white", "squawkabilly_yellow",
  ],
  clodsire: ["clodsiresb"],
  indeedee_male: ["indeedee"],
};

/**
 * The dex speciesId matching a PvPoke species id, or null when this dex has nothing for it.
 * Returned without the shadow suffix, the way the universal format keeps it.
 */
export function resolveDexSpeciesId(speciesId, shadow, pokemonOptions) {
  const toKey = (id) => (shadow ? `${id}${SHADOW_SUFFIX}` : id);
  if (pokemonOptions?.[toKey(speciesId)] != null) {
    return speciesId;
  }
  const fallback = (PVPOKE_SPECIES_FALLBACKS[speciesId] ?? [])
    .find((id) => pokemonOptions?.[toKey(id)] != null);
  return fallback ?? null;
}

/** `{ speciesKey: sid }`, so pvpoke-converter can fill sids without its own network fetch. */
export function buildSidMap(pokemonOptions) {
  const map = {};
  Object.keys(pokemonOptions ?? {}).forEach((key) => {
    map[key] = pokemonOptions[key]?.sid;
  });
  return map;
}

/**
 * The filled slots of a form, each paired with the index it came from so per-slot data the session
 * shape has no room for (level, IVs) can be reattached afterwards.
 */
function collectFilledSlots(values, teamSize, pokemonOptions) {
  const slots = [];
  for (let index = 0; index < teamSize; index += 1) {
    const speciesName = values?.pokemon?.[index];
    if (speciesName == null || speciesName === "") {
      continue;
    }
    slots.push({
      index,
      pokemon: {
        speciesName,
        // Dracoviz has never written a shadow boolean — the suffix on the species key is the only
        // record of it, and pvpoke-converter reads the boolean. Without this every export would
        // silently lose shadow status.
        shadow: speciesName.endsWith(SHADOW_SUFFIX),
        sid: pokemonOptions?.[speciesName]?.sid,
        fastMove: values?.fastMoves?.[index] ?? "",
        chargedMoves: [
          values?.chargedMoves?.[index]?.[0] ?? "",
          values?.chargedMoves?.[index]?.[1] ?? "",
        ],
        cp: toNumber(values?.cp?.[index]),
        hp: toNumber(values?.hp?.[index]),
        best_buddy: toBoolean(values?.bestBuddy?.[index]),
        purified: toBoolean(values?.purified?.[index]),
        nickname: toText(values?.nickname?.[index]),
      },
    });
  }
  return slots;
}

/** Form values -> `DracovizSessionPokemon[]`. Empty slots are dropped. */
export function formValuesToSessionTeam(values, teamSize = TEAM_SIZE, pokemonOptions) {
  return collectFilledSlots(values, teamSize, pokemonOptions).map((slot) => slot.pokemon);
}

/** Form values -> `UnifiedPokemon[]`, carrying the level/IVs a PvPoke import brought in. */
export function formValuesToUnified(values, teamSize = TEAM_SIZE, pokemonOptions) {
  const slots = collectFilledSlots(values, teamSize, pokemonOptions);
  const unified = sessionTeamToUnified(slots.map((slot) => slot.pokemon));

  return unified.map((pokemon, i) => {
    const { index } = slots[i];
    const extras = {
      level: toNumber(values?.level?.[index]),
      attackIv: toNumber(values?.attackIv?.[index]),
      defenseIv: toNumber(values?.defenseIv?.[index]),
      hpIv: toNumber(values?.hpIv?.[index]),
    };
    Object.keys(extras).forEach((key) => {
      if (extras[key] === undefined) {
        delete extras[key];
      }
    });
    return { ...pokemon, ...extras };
  });
}

/** `DracovizSessionPokemon[]` -> form values. */
export function sessionTeamToFormValues(team, unified) {
  const values = {
    pokemon: [],
    cp: [],
    hp: [],
    chargedMoves: [],
    fastMoves: [],
    nickname: [],
    purified: [],
    bestBuddy: [],
    level: [],
    attackIv: [],
    defenseIv: [],
    hpIv: [],
  };

  (team ?? []).forEach((pokemon, index) => {
    values.pokemon.push(pokemon.speciesName ?? "");
    values.cp.push(pokemon.cp ?? "");
    values.hp.push(pokemon.hp ?? "");
    values.chargedMoves.push([
      pokemon.chargedMoves?.[0] ?? "",
      pokemon.chargedMoves?.[1] ?? "",
    ]);
    values.fastMoves.push(pokemon.fastMove ?? "");
    values.nickname.push(pokemon.nickname ?? "");
    values.purified.push(pokemon.purified === true);
    values.bestBuddy.push(pokemon.best_buddy === true);
    values.level.push(unified?.[index]?.level ?? "");
    values.attackIv.push(unified?.[index]?.attackIv ?? "");
    values.defenseIv.push(unified?.[index]?.defenseIv ?? "");
    values.hpIv.push(unified?.[index]?.hpIv ?? "");
  });

  return values;
}

/** `UnifiedPokemon[]` -> form values. */
export function unifiedToFormValues(unified, pokemonOptions) {
  const team = unifiedToSessionTeam(unified ?? [], buildSidMap(pokemonOptions));
  return sessionTeamToFormValues(team, unified);
}

/**
 * `UnifiedPokemon[]` -> the shape PokemonView renders. It keys the shadow icon off the localized
 * display name, which the dex already spells as "Swampert (Shadow)".
 */
export function unifiedToDisplayPokemon(unified, pokemonOptions) {
  return unifiedToSessionTeam(unified ?? [], buildSidMap(pokemonOptions)).map((pokemon) => ({
    speciesName: pokemonOptions?.[pokemon.speciesName]?.speciesName ?? pokemon.speciesName,
    sid: pokemon.sid,
    nickname: pokemon.nickname ?? null,
    cp: pokemon.cp ?? null,
    hp: pokemon.hp ?? null,
    fastMove: pokemon.fastMove === "" ? null : pokemon.fastMove,
    chargedMoves: pokemon.chargedMoves?.[0] ? pokemon.chargedMoves : null,
    purified: pokemon.purified,
    bestBuddy: pokemon.best_buddy,
  }));
}

/** Empty values for every field the builder owns, used to clear a form between teams. */
export function emptyFormValues(teamSize = TEAM_SIZE) {
  return sessionTeamToFormValues(
    Array(teamSize).fill(0).map(() => ({ speciesName: "", chargedMoves: ["", ""], fastMove: "" })),
    [],
  );
}

/**
 * The PvPoke league a meta corresponds to, used to pick sensible default levels/IVs when exporting
 * a team that has no level data of its own.
 */
export function leagueForMaxCP(maxCP) {
  if (maxCP === 500) return "little";
  if (maxCP === 1500) return "great";
  if (maxCP === 2500) return "ultra";
  return "master";
}
