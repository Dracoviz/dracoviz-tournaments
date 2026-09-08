/**
 * Generates the sample usage data the /usage page is built against before the API exists.
 *
 *   node scripts/generate-sample-usage.js [--out-dir <path>] [--periods <n>]
 *
 * The output matches the shape /api/usage/get and /api/usage/species return, so switching
 * pages-sections/usage-sections/useUsageData.js from "sample" to "api" needs no other changes.
 *
 * Everything is driven by a seeded PRNG rather than Math.random, so re-running the script produces
 * a byte-identical file and the checked-in fixture never churns in diffs.
 *
 * The data deliberately contains the awkward cases the page has to survive:
 *   - a species that falls below the reporting threshold partway through its history
 *   - a species that appears for the first time in the newest period
 *   - a species nobody has a win/loss record for, so its win rates are null
 *   - a quiet period with far fewer tournaments than its neighbours
 *   - a species with no partner that clears the partner threshold
 */

const fs = require('fs');
const path = require('path');

// Mirrors scripts/lib/periods.js in dracoviz-site. Frozen: it defines the bucket boundaries.
const PERIOD_EPOCH = Date.UTC(2024, 0, 1);
const PERIOD_MS = 14 * 24 * 60 * 60 * 1000;

const META = 'Play Pokemon 2024';
const SPECIES_MIN_COUNT = 20;
const PARTNER_MIN_COUNT = 10;
const DEFAULT_PERIODS = 8;
const SEED = 0x5eed1e;

/** A realistic Great League field, with real sprite ids and real move ids from the gamemaster. */
const SPECIES = [
  {"speciesId": "azumarill", "speciesName": "Azumarill", "sid": 5888, "types": ["water", "fairy"], "fastMoves": ["BUBBLE", "ROCK_SMASH"], "chargedMoves": ["HYDRO_PUMP", "ICE_BEAM", "PLAY_ROUGH"], "shadowEligible": false},
  {"speciesId": "registeel", "speciesName": "Registeel", "sid": 12128, "types": ["steel"], "fastMoves": ["METAL_CLAW", "ROCK_SMASH"], "chargedMoves": ["FLASH_CANNON", "FOCUS_BLAST", "HYPER_BEAM", "ZAP_CANNON"], "shadowEligible": true},
  {"speciesId": "medicham", "speciesName": "Medicham", "sid": 9856, "types": ["fighting", "psychic"], "fastMoves": ["COUNTER", "PSYCHO_CUT"], "chargedMoves": ["DYNAMIC_PUNCH", "ICE_PUNCH", "PSYCHIC", "POWER_UP_PUNCH"], "shadowEligible": false},
  {"speciesId": "swampert", "speciesName": "Swampert", "sid": 8320, "types": ["water", "ground"], "fastMoves": ["MUD_SHOT", "WATER_GUN"], "chargedMoves": ["EARTHQUAKE", "SLUDGE_WAVE", "SURF", "HYDRO_CANNON"], "shadowEligible": true},
  {"speciesId": "altaria", "speciesName": "Altaria", "sid": 10688, "types": ["dragon", "flying"], "fastMoves": ["DRAGON_BREATH", "PECK"], "chargedMoves": ["DAZZLING_GLEAM", "DRAGON_PULSE", "SKY_ATTACK", "MOONBLAST"], "shadowEligible": true},
  {"speciesId": "bastiodon", "speciesName": "Bastiodon", "sid": 13152, "types": ["rock", "steel"], "fastMoves": ["IRON_TAIL", "SMACK_DOWN"], "chargedMoves": ["FLAMETHROWER", "FLASH_CANNON", "STONE_EDGE"], "shadowEligible": true},
  {"speciesId": "skarmory", "speciesName": "Skarmory", "sid": 7264, "types": ["steel", "flying"], "fastMoves": ["AIR_SLASH", "STEEL_WING"], "chargedMoves": ["BRAVE_BIRD", "FLASH_CANNON", "SKY_ATTACK", "DRILL_RUN"], "shadowEligible": true},
  {"speciesId": "umbreon", "speciesName": "Umbreon", "sid": 6304, "types": ["dark"], "fastMoves": ["FEINT_ATTACK", "SNARL"], "chargedMoves": ["DARK_PULSE", "FOUL_PLAY", "LAST_RESORT", "PSYCHIC"], "shadowEligible": false},
  {"speciesId": "lickitung", "speciesName": "Lickitung", "sid": 3456, "types": ["normal"], "fastMoves": ["LICK", "ZEN_HEADBUTT"], "chargedMoves": ["HYPER_BEAM", "POWER_WHIP", "STOMP", "BODY_SLAM"], "shadowEligible": false},
  {"speciesId": "scrafty", "speciesName": "Scrafty", "sid": 17920, "types": ["dark", "fighting"], "fastMoves": ["COUNTER", "SNARL"], "chargedMoves": ["ACID_SPRAY", "POWER_UP_PUNCH", "FOUL_PLAY", "THUNDER_PUNCH"], "shadowEligible": false},
  {"speciesId": "talonflame", "speciesName": "Talonflame", "sid": 21216, "types": ["fire", "flying"], "fastMoves": ["PECK", "FIRE_SPIN"], "chargedMoves": ["BRAVE_BIRD", "FIRE_BLAST", "FLAME_CHARGE", "HURRICANE"], "shadowEligible": true},
  {"speciesId": "noctowl", "speciesName": "Noctowl", "sid": 5248, "types": ["normal", "flying"], "fastMoves": ["EXTRASENSORY", "WING_ATTACK"], "chargedMoves": ["NIGHT_SHADE", "PSYCHIC", "SKY_ATTACK", "SHADOW_BALL"], "shadowEligible": true},
  {"speciesId": "gastrodon", "speciesName": "Gastrodon", "sid": 13537, "types": ["water", "ground"], "fastMoves": ["HIDDEN_POWER_BUG", "HIDDEN_POWER_DARK"], "chargedMoves": ["BODY_SLAM", "WATER_PULSE", "EARTH_POWER", "EARTHQUAKE"], "shadowEligible": false},
  {"speciesId": "jellicent", "speciesName": "Jellicent", "sid": 18976, "types": ["water", "ghost"], "fastMoves": ["BUBBLE", "HEX"], "chargedMoves": ["SHADOW_BALL", "ICE_BEAM", "BUBBLE_BEAM", "SURF"], "shadowEligible": false},
  {"speciesId": "annihilape", "speciesName": "Annihilape", "sid": 31328, "types": ["fighting", "ghost"], "fastMoves": ["LOW_KICK", "COUNTER"], "chargedMoves": ["CLOSE_COMBAT", "LOW_SWEEP", "NIGHT_SLASH", "ICE_PUNCH"], "shadowEligible": true},
  {"speciesId": "clodsire", "speciesName": "Clodsire", "sid": 31360, "types": ["poison", "ground"], "fastMoves": ["POISON_STING", "MUD_SHOT"], "chargedMoves": ["SLUDGE_BOMB", "EARTHQUAKE", "STONE_EDGE", "ACID_SPRAY"], "shadowEligible": false},
  {"speciesId": "dunsparce", "speciesName": "Dunsparce", "sid": 6592, "types": ["normal"], "fastMoves": ["ASTONISH", "BITE"], "chargedMoves": ["DIG", "DRILL_RUN", "ROCK_SLIDE"], "shadowEligible": false},
  {"speciesId": "feraligatr", "speciesName": "Feraligatr", "sid": 5120, "types": ["water"], "fastMoves": ["BITE", "WATER_GUN"], "chargedMoves": ["CRUNCH", "HYDRO_CANNON", "HYDRO_PUMP", "ICE_BEAM"], "shadowEligible": true},
  {"speciesId": "carbink", "speciesName": "Carbink", "sid": 22496, "types": ["rock", "fairy"], "fastMoves": ["TACKLE", "ROCK_THROW"], "chargedMoves": ["ROCK_SLIDE", "MOONBLAST", "POWER_GEM"], "shadowEligible": false},
  {"speciesId": "mandibuzz", "speciesName": "Mandibuzz", "sid": 20160, "types": ["dark", "flying"], "fastMoves": ["SNARL", "AIR_SLASH"], "chargedMoves": ["DARK_PULSE", "AERIAL_ACE", "FOUL_PLAY", "SHADOW_BALL"], "shadowEligible": false},
  {"speciesId": "charjabug", "speciesName": "Charjabug", "sid": 23584, "types": ["bug", "electric"], "fastMoves": ["BUG_BITE", "SPARK"], "chargedMoves": ["X_SCISSOR", "DISCHARGE", "CRUNCH"], "shadowEligible": true},
  {"speciesId": "diggersby", "speciesName": "Diggersby", "sid": 21120, "types": ["normal", "ground"], "fastMoves": ["MUD_SHOT", "QUICK_ATTACK"], "chargedMoves": ["DIG", "HYPER_BEAM", "EARTHQUAKE", "FIRE_PUNCH"], "shadowEligible": true},
  {"speciesId": "malamar", "speciesName": "Malamar", "sid": 21984, "types": ["dark", "psychic"], "fastMoves": ["PECK", "PSYCHO_CUT"], "chargedMoves": ["PSYBEAM", "FOUL_PLAY", "SUPER_POWER", "HYPER_BEAM"], "shadowEligible": true},
  {"speciesId": "wigglytuff", "speciesName": "Wigglytuff", "sid": 1280, "types": ["normal", "fairy"], "fastMoves": ["FEINT_ATTACK", "POUND"], "chargedMoves": ["DAZZLING_GLEAM", "HYPER_BEAM", "ICE_BEAM", "PLAY_ROUGH"], "shadowEligible": false},
  {"speciesId": "toxapex", "speciesName": "Toxapex", "sid": 23936, "types": ["poison", "water"], "fastMoves": ["POISON_JAB", "BITE"], "chargedMoves": ["BRINE", "GUNK_SHOT", "SLUDGE_WAVE"], "shadowEligible": false},
  {"speciesId": "cresselia", "speciesName": "Cresselia", "sid": 15616, "types": ["psychic"], "fastMoves": ["CONFUSION", "PSYCHO_CUT"], "chargedMoves": ["AURORA_BEAM", "FUTURE_SIGHT", "MOONBLAST", "GRASS_KNOT"], "shadowEligible": true},
  {"speciesId": "sableye", "speciesName": "Sableye", "sid": 9664, "types": ["dark", "ghost"], "fastMoves": ["FEINT_ATTACK", "SHADOW_CLAW"], "chargedMoves": ["FOUL_PLAY", "POWER_GEM", "SHADOW_SNEAK", "DAZZLING_GLEAM"], "shadowEligible": true},
  {"speciesId": "whiscash", "speciesName": "Whiscash", "sid": 10880, "types": ["water", "ground"], "fastMoves": ["MUD_SHOT", "WATER_GUN"], "chargedMoves": ["BLIZZARD", "MUD_BOMB", "WATER_PULSE", "SCALD"], "shadowEligible": true},
  {"speciesId": "drifblim", "speciesName": "Drifblim", "sid": 13632, "types": ["ghost", "flying"], "fastMoves": ["ASTONISH", "HEX"], "chargedMoves": ["ICY_WIND", "OMINOUS_WIND", "SHADOW_BALL", "MYSTICAL_FIRE"], "shadowEligible": true},
  {"speciesId": "abomasnow", "speciesName": "Abomasnow", "sid": 14720, "types": ["grass", "ice"], "fastMoves": ["POWDER_SNOW", "RAZOR_LEAF"], "chargedMoves": ["BLIZZARD", "ENERGY_BALL", "OUTRAGE", "WEATHER_BALL_ICE"], "shadowEligible": true},
  {"speciesId": "froslass", "speciesName": "Froslass", "sid": 15296, "types": ["ice", "ghost"], "fastMoves": ["HEX", "POWDER_SNOW"], "chargedMoves": ["AVALANCHE", "CRUNCH", "SHADOW_BALL", "TRIPLE_AXEL"], "shadowEligible": true},
  {"speciesId": "pelipper", "speciesName": "Pelipper", "sid": 8928, "types": ["water", "flying"], "fastMoves": ["WATER_GUN", "WING_ATTACK"], "chargedMoves": ["BLIZZARD", "HURRICANE", "HYDRO_PUMP", "WEATHER_BALL_WATER"], "shadowEligible": false},
  {"speciesId": "serperior", "speciesName": "Serperior", "sid": 15904, "types": ["grass"], "fastMoves": ["IRON_TAIL", "VINE_WHIP"], "chargedMoves": ["GRASS_KNOT", "LEAF_TORNADO", "AERIAL_ACE", "FRENZY_PLANT"], "shadowEligible": true},
  {"speciesId": "venusaur", "speciesName": "Venusaur", "sid": 96, "types": ["grass", "poison"], "fastMoves": ["RAZOR_LEAF", "VINE_WHIP"], "chargedMoves": ["FRENZY_PLANT", "PETAL_BLIZZARD", "SLUDGE_BOMB", "SOLAR_BEAM"], "shadowEligible": true},
  {"speciesId": "quagsire", "speciesName": "Quagsire", "sid": 6240, "types": ["water", "ground"], "fastMoves": ["MUD_SHOT", "WATER_GUN"], "chargedMoves": ["EARTHQUAKE", "SLUDGE_BOMB", "STONE_EDGE", "ACID_SPRAY"], "shadowEligible": true},
  {"speciesId": "poliwrath", "speciesName": "Poliwrath", "sid": 1984, "types": ["water", "fighting"], "fastMoves": ["BUBBLE", "MUD_SHOT"], "chargedMoves": ["DYNAMIC_PUNCH", "HYDRO_PUMP", "ICE_PUNCH", "SUBMISSION"], "shadowEligible": true},
  {"speciesId": "hypno", "speciesName": "Hypno", "sid": 3104, "types": ["psychic"], "fastMoves": ["CONFUSION", "ZEN_HEADBUTT"], "chargedMoves": ["FOCUS_BLAST", "FUTURE_SIGHT", "PSYCHIC", "PSYSHOCK"], "shadowEligible": true},
  {"speciesId": "vigoroth", "speciesName": "Vigoroth", "sid": 9216, "types": ["normal"], "fastMoves": ["COUNTER", "SCRATCH"], "chargedMoves": ["BODY_SLAM", "BRICK_BREAK", "BULLDOZE", "ROCK_SLIDE"], "shadowEligible": true},
  {"speciesId": "greedent", "speciesName": "Greedent", "sid": 26240, "types": ["normal"], "fastMoves": ["TACKLE", "BITE"], "chargedMoves": ["BODY_SLAM", "CRUNCH", "TRAILBLAZE"], "shadowEligible": false},
  {"speciesId": "chesnaught", "speciesName": "Chesnaught", "sid": 20864, "types": ["grass", "fighting"], "fastMoves": ["LOW_KICK", "SMACK_DOWN"], "chargedMoves": ["GYRO_BALL", "ENERGY_BALL", "SUPER_POWER", "SOLAR_BEAM"], "shadowEligible": true},
  {"speciesId": "guzzlord", "speciesName": "Guzzlord", "sid": 25568, "types": ["dark", "dragon"], "fastMoves": ["SNARL", "DRAGON_TAIL"], "chargedMoves": ["BRUTAL_SWING", "DRAGON_CLAW", "CRUNCH", "SLUDGE_BOMB"], "shadowEligible": false},
  {"speciesId": "lanturn", "speciesName": "Lanturn", "sid": 5472, "types": ["water", "electric"], "fastMoves": ["CHARGE_BEAM", "WATER_GUN"], "chargedMoves": ["HYDRO_PUMP", "THUNDER", "THUNDERBOLT", "SURF"], "shadowEligible": false},
  {"speciesId": "primeape", "speciesName": "Primeape", "sid": 1824, "types": ["fighting"], "fastMoves": ["COUNTER", "KARATE_CHOP"], "chargedMoves": ["CLOSE_COMBAT", "CROSS_CHOP", "LOW_SWEEP", "NIGHT_SLASH"], "shadowEligible": true},
  {"speciesId": "araquanid", "speciesName": "Araquanid", "sid": 24064, "types": ["water", "bug"], "fastMoves": ["INFESTATION", "BUG_BITE"], "chargedMoves": ["BUG_BUZZ", "BUBBLE_BEAM", "MIRROR_COAT", "WATER_PULSE"], "shadowEligible": true},
  {"speciesId": "dubwool", "speciesName": "Dubwool", "sid": 26624, "types": ["normal"], "fastMoves": ["TACKLE", "TAKE_DOWN"], "chargedMoves": ["WILD_CHARGE", "PAYBACK", "BODY_SLAM"], "shadowEligible": false},
  {"speciesId": "gligar", "speciesName": "Gligar", "sid": 6624, "types": ["ground", "flying"], "fastMoves": ["FURY_CUTTER", "WING_ATTACK"], "chargedMoves": ["AERIAL_ACE", "DIG", "NIGHT_SLASH"], "shadowEligible": true},
  {"speciesId": "forretress", "speciesName": "Forretress", "sid": 6560, "types": ["bug", "steel"], "fastMoves": ["BUG_BITE", "STRUGGLE_BUG"], "chargedMoves": ["EARTHQUAKE", "HEAVY_SLAM", "ROCK_TOMB", "SAND_TOMB"], "shadowEligible": true},
  {"speciesId": "obstagoon", "speciesName": "Obstagoon", "sid": 27584, "types": ["dark", "normal"], "fastMoves": ["COUNTER", "LICK"], "chargedMoves": ["CROSS_CHOP", "NIGHT_SLASH", "HYPER_BEAM", "GUNK_SHOT"], "shadowEligible": true},
  {"speciesId": "politoed", "speciesName": "Politoed", "sid": 5952, "types": ["water"], "fastMoves": ["BUBBLE", "MUD_SHOT"], "chargedMoves": ["BLIZZARD", "EARTHQUAKE", "HYDRO_PUMP", "SURF"], "shadowEligible": true},
  {"speciesId": "cofagrigus", "speciesName": "Cofagrigus", "sid": 18016, "types": ["ghost"], "fastMoves": ["ASTONISH", "ZEN_HEADBUTT"], "chargedMoves": ["SHADOW_BALL", "DARK_PULSE", "PSYCHIC", "ENERGY_BALL"], "shadowEligible": true},
  {"speciesId": "goodra", "speciesName": "Goodra", "sid": 22592, "types": ["dragon"], "fastMoves": ["WATER_GUN", "DRAGON_BREATH"], "chargedMoves": ["DRACO_METEOR", "SLUDGE_WAVE", "MUDDY_WATER", "POWER_WHIP"], "shadowEligible": false},
  {"speciesId": "tentacruel", "speciesName": "Tentacruel", "sid": 2336, "types": ["water", "poison"], "fastMoves": ["ACID", "POISON_JAB"], "chargedMoves": ["BLIZZARD", "HYDRO_PUMP", "SLUDGE_WAVE", "ACID_SPRAY"], "shadowEligible": true},
  {"speciesId": "furret", "speciesName": "Furret", "sid": 5184, "types": ["normal"], "fastMoves": ["QUICK_ATTACK", "SUCKER_PUNCH"], "chargedMoves": ["BRICK_BREAK", "DIG", "HYPER_BEAM", "SWIFT"], "shadowEligible": false},
  {"speciesId": "empoleon", "speciesName": "Empoleon", "sid": 12640, "types": ["water", "steel"], "fastMoves": ["METAL_CLAW", "WATERFALL"], "chargedMoves": ["BLIZZARD", "FLASH_CANNON", "HYDRO_PUMP", "HYDRO_CANNON"], "shadowEligible": true},
  {"speciesId": "haunter", "speciesName": "Haunter", "sid": 2976, "types": ["ghost", "poison"], "fastMoves": ["ASTONISH", "LICK"], "chargedMoves": ["DARK_PULSE", "SHADOW_BALL", "SHADOW_PUNCH", "SLUDGE_BOMB"], "shadowEligible": true},
  {"speciesId": "muk_alolan", "speciesName": "Muk", "sid": 2849, "types": ["poison", "dark"], "fastMoves": ["BITE", "POISON_JAB"], "chargedMoves": ["DARK_PULSE", "GUNK_SHOT", "SLUDGE_WAVE", "ACID_SPRAY"], "shadowEligible": true},
  {"speciesId": "steelix", "speciesName": "Steelix", "sid": 6656, "types": ["steel", "ground"], "fastMoves": ["DRAGON_TAIL", "IRON_TAIL"], "chargedMoves": ["CRUNCH", "EARTHQUAKE", "HEAVY_SLAM", "PSYCHIC_FANGS"], "shadowEligible": true},
  {"speciesId": "marowak_alolan", "speciesName": "Marowak", "sid": 3361, "types": ["fire", "ghost"], "fastMoves": ["HEX", "ROCK_SMASH"], "chargedMoves": ["BONE_CLUB", "FIRE_BLAST", "SHADOW_BALL", "FLAME_WHEEL"], "shadowEligible": true},
  {"speciesId": "alomomola", "speciesName": "Alomomola", "sid": 19008, "types": ["water"], "fastMoves": ["WATERFALL", "HIDDEN_POWER_BUG"], "chargedMoves": ["HYDRO_PUMP", "BLIZZARD", "PSYCHIC"], "shadowEligible": false},
  {"speciesId": "beedrill", "speciesName": "Beedrill", "sid": 480, "types": ["bug", "poison"], "fastMoves": ["BUG_BITE", "INFESTATION"], "chargedMoves": ["AERIAL_ACE", "SLUDGE_BOMB", "X_SCISSOR", "FELL_STINGER"], "shadowEligible": true},
  {"speciesId": "mantine", "speciesName": "Mantine", "sid": 7232, "types": ["water", "flying"], "fastMoves": ["BUBBLE", "BULLET_SEED"], "chargedMoves": ["AERIAL_ACE", "ICE_BEAM", "WATER_PULSE", "BUBBLE_BEAM"], "shadowEligible": false},];

// --- Seeded randomness ---

function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(SEED);
const between = (min, max) => min + rand() * (max - min);
const intBetween = (min, max) => Math.round(between(min, max));
const pick = (list) => list[Math.floor(rand() * list.length)];

// --- Period helpers ---

const periodBounds = (index) => ({
  periodStart: new Date(PERIOD_EPOCH + index * PERIOD_MS).toISOString(),
  periodEnd: new Date(PERIOD_EPOCH + (index + 1) * PERIOD_MS).toISOString(),
});

const lastClosedPeriodIndex = () => Math.floor((Date.now() - PERIOD_EPOCH) / PERIOD_MS) - 1;

// --- Shaping ---

const rate = (wins, losses) => (wins + losses > 0 ? wins / (wins + losses) : null);

/**
 * Splits a win rate into a plausible win/loss record. Tournaments are mostly 4-6 rounds, so the
 * record scales with how many players brought the species.
 */
function record(count, winRate, roundsPerPlayer) {
  if (winRate == null) {
    return {
      matchWins: 0,
      matchLosses: 0,
      matchWinRate: null,
      gameWins: 0,
      gameLosses: 0,
      gameWinRate: null,
      teamsWithRecord: 0,
    };
  }
  const matches = Math.max(1, Math.round(count * roundsPerPlayer));
  const matchWins = Math.round(matches * winRate);
  const matchLosses = matches - matchWins;
  // Game win rate tracks match win rate but is always pulled towards even, since losing a match
  // usually still means winning a game.
  const gameRate = 0.5 + (winRate - 0.5) * 0.62;
  const games = Math.round(matches * between(2.2, 2.6));
  const gameWins = Math.round(games * gameRate);
  return {
    matchWins,
    matchLosses,
    matchWinRate: rate(matchWins, matchLosses),
    gameWins,
    gameLosses: games - gameWins,
    gameWinRate: rate(gameWins, games - gameWins),
    teamsWithRecord: count,
  };
}

/** Two or three movesets per species, the first one dominant, frequencies summing to 1. */
function buildMovesets(species, count, winRate, roundsPerPlayer) {
  const combos = [];
  const seen = new Set();
  const wanted = Math.min(3, species.chargedMoves.length >= 3 ? 3 : 2);
  let guard = 0;
  while (combos.length < wanted && guard < 40) {
    guard += 1;
    const fastMove = pick(species.fastMoves);
    const first = pick(species.chargedMoves);
    const second = pick(species.chargedMoves.filter((m) => m !== first));
    if (second == null) break;
    const chargedMoves = [first, second].sort();
    const key = [fastMove, ...chargedMoves].join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    combos.push({ fastMove, chargedMoves });
  }

  // A dominant moveset and a tail, so the share column has something to show.
  const weights = combos.map((unused, i) => (i === 0 ? between(0.55, 0.78) : between(0.08, 0.3)));
  const weightTotal = weights.reduce((sum, w) => sum + w, 0);
  let remaining = count;

  return combos.map((combo, i) => {
    const isLast = i === combos.length - 1;
    const movesetCount = isLast
      ? remaining
      : Math.max(1, Math.round((weights[i] / weightTotal) * count));
    remaining -= movesetCount;
    // Movesets diverge a little from the species average, which is the point of the breakdown.
    const movesetWinRate = winRate == null
      ? null
      : Math.min(0.85, Math.max(0.15, winRate + between(-0.06, 0.06)));
    return {
      ...combo,
      count: movesetCount,
      frequency: movesetCount / count,
      ...record(movesetCount, movesetWinRate, roundsPerPlayer),
    };
  }).filter((moveset) => moveset.count > 0);
}

function buildPartners(species, entries, count, roundsPerPlayer, noPartners, speciesWinRate) {
  if (noPartners) {
    return [];
  }
  return entries
    .filter((other) => other.species.speciesId !== species.speciesId)
    .slice(0, intBetween(4, 9))
    .map((other) => {
      const partnerCount = Math.round(count * between(0.12, 0.55));
      // A pairing's record comes from the players who brought this species, so if none of them have
      // a record then neither can any of its pairings. The real aggregation cannot produce a
      // partner win rate here, so neither should the fixture.
      const winRate = speciesWinRate == null
        ? null
        : Math.min(0.8, Math.max(0.2, between(0.42, 0.62)));
      return {
        speciesId: other.species.speciesId,
        speciesName: other.species.speciesName,
        sid: other.species.sid,
        count: partnerCount,
        frequency: partnerCount / count,
        ...record(partnerCount, winRate, roundsPerPlayer),
      };
    })
    .filter((partner) => partner.count >= PARTNER_MIN_COUNT)
    .sort((a, b) => b.count - a.count);
}

// --- Generation ---

function generate(periodCount) {
  const newestIndex = lastClosedPeriodIndex();
  const indices = [];
  for (let i = periodCount - 1; i >= 0; i -= 1) indices.push(newestIndex - i);

  // Each species drifts over time as a random walk, so trends look like a meta shifting rather than
  // like noise.
  const popularity = new Map(SPECIES.map((s, i) => [s.speciesId, between(0.04, i < 12 ? 0.62 : 0.3)]));
  const winRates = new Map(SPECIES.map((s) => [s.speciesId, between(0.44, 0.58)]));

  // The deliberate edge cases.
  const fadingId = SPECIES[6].speciesId; // drops below the threshold partway through
  const newcomerId = SPECIES[SPECIES.length - 1].speciesId; // only shows up in the newest period
  const noRecordId = SPECIES[9].speciesId; // nobody has a win/loss record
  const lonerId = SPECIES[11].speciesId; // no partner clears the threshold
  const quietIndex = indices[Math.floor(periodCount / 2)]; // a much smaller period

  const periods = [];
  const species = [];

  indices.forEach((periodIndex, step) => {
    const isQuiet = periodIndex === quietIndex;
    const tournamentCount = isQuiet ? intBetween(3, 5) : intBetween(14, 26);
    const teamCount = tournamentCount * intBetween(11, 19);
    const roundsPerPlayer = between(3.4, 4.6);

    const entries = [];
    SPECIES.forEach((s) => {
      // Random walk, clamped, plus a per-period wobble.
      const drift = between(-0.055, 0.055);
      const next = Math.min(0.75, Math.max(0.01, popularity.get(s.speciesId) + drift));
      popularity.set(s.speciesId, next);
      winRates.set(
        s.speciesId,
        Math.min(0.68, Math.max(0.34, winRates.get(s.speciesId) + between(-0.03, 0.03))),
      );

      let share = next;
      if (s.speciesId === fadingId) {
        // Falls off a cliff halfway through, so its trend line has a real gap in it.
        share = step < periodCount / 2 ? Math.max(share, 0.25) : 0.02;
      }
      if (s.speciesId === newcomerId) {
        share = step === indices.length - 1 ? 0.34 : 0;
      }

      const count = Math.round(teamCount * share);
      if (count < SPECIES_MIN_COUNT) return;

      const winRate = s.speciesId === noRecordId ? null : winRates.get(s.speciesId);
      entries.push({
        species: s, count, winRate, shadowRate: s.shadowEligible ? between(0, 0.55) : 0,
      });
    });

    entries.sort((a, b) => b.count - a.count);

    const lightPokemon = entries.map((entry) => {
      const shadowCount = Math.round(entry.count * entry.shadowRate);
      return {
        speciesId: entry.species.speciesId,
        speciesName: entry.species.speciesName,
        sid: entry.species.sid,
        count: entry.count,
        usage: entry.count / teamCount,
        shadowCount,
        shadowRate: shadowCount / entry.count,
        movesetCount: entry.count,
        ...record(entry.count, entry.winRate, roundsPerPlayer),
      };
    });

    const { periodStart, periodEnd } = periodBounds(periodIndex);
    periods.push({
      meta: META,
      periodIndex,
      periodStart,
      periodEnd,
      computedAt: new Date(Date.parse(periodEnd) + 6 * 60 * 60 * 1000).toISOString(),
      schemaVersion: 1,
      tournamentCount,
      teamCount,
      pokemonCount: teamCount * 6,
      teamsWithMovesets: Math.round(teamCount * between(0.93, 1)),
      teamsWithRecord: teamCount,
      totalMatches: Math.round(teamCount * roundsPerPlayer),
      totalGames: Math.round(teamCount * roundsPerPlayer * 2.4),
      speciesCount: entries.length,
      pokemon: lightPokemon,
    });

    entries.forEach((entry, i) => {
      species.push({
        meta: META,
        periodIndex,
        periodStart,
        periodEnd,
        schemaVersion: 1,
        ...lightPokemon[i],
        movesets: buildMovesets(entry.species, entry.count, entry.winRate, roundsPerPlayer),
        partners: buildPartners(
          entry.species,
          entries,
          entry.count,
          roundsPerPlayer,
          entry.species.speciesId === lonerId,
          entry.winRate,
        ),
      });
    });
  });

  // Newest first, matching the API.
  periods.reverse();
  return {
    meta: META,
    periods,
    species,
    availablePeriods: {
      total: periods.length,
      oldestIndex: indices[0],
      newestIndex: indices[indices.length - 1],
    },
  };
}

// --- Main ---

function main() {
  const argv = process.argv.slice(2);
  let outDir = path.join(__dirname, '..', 'pages-sections', 'usage-sections');
  let periodCount = DEFAULT_PERIODS;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out-dir') { outDir = argv[i + 1]; i += 1; } else if (argv[i] === '--periods') { periodCount = Number(argv[i + 1]); i += 1; } else {
      console.error(`Unknown option "${argv[i]}". See the header of this file for usage.`);
      process.exit(1);
    }
  }

  const sample = generate(periodCount);

  // Split the same way the API is split: the overview is loaded up front, and the much larger
  // moveset and partner data is only pulled in when someone drills into a Pokemon.
  const overviewPath = path.join(outDir, 'sampleUsage.json');
  const speciesPath = path.join(outDir, 'sampleUsageSpecies.json');
  const { species, ...overview } = sample;
  fs.writeFileSync(overviewPath, `${JSON.stringify(overview)}\n`);
  fs.writeFileSync(speciesPath, `${JSON.stringify({ meta: sample.meta, species })}\n`);

  const kb = (file) => `${Math.round(fs.statSync(file).size / 1024)}KB`;
  console.log(`Wrote ${overviewPath} (${kb(overviewPath)})`);
  console.log(`Wrote ${speciesPath} (${kb(speciesPath)})`);
  console.log(`  ${sample.periods.length} periods, ${species.length} species documents`);
  sample.periods.forEach((p) => {
    console.log(
      `  ${p.periodStart.slice(0, 10)}  ${String(p.tournamentCount).padStart(3)} events  `
      + `${String(p.teamCount).padStart(4)} teams  ${String(p.speciesCount).padStart(3)} species`,
    );
  });
}

main();
