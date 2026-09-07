const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// --- Constants ---

const PVPOKE_URL = 'https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/gamemaster/moves.json';
const BULBAPEDIA_GO_URL = 'https://bulbapedia.bulbagarden.net/wiki/List_of_moves_in_Pok%C3%A9mon_GO_in_other_languages';
const BULBAPEDIA_GENERAL_URL = 'https://bulbapedia.bulbagarden.net/wiki/List_of_moves_in_other_languages';

const API_DIR = path.join(__dirname, '..', 'api');
const MOVE_DATA_PATH = path.join(API_DIR, 'moveData.json');
const MOVES_PATH = path.join(API_DIR, 'moves.json');

// Language key order matching existing moves.json
const LANG_ORDER = ['en', 'pt', 'zhhant', 'fr', 'de', 'hi', 'id', 'it', 'jp', 'kr', 'ru', 'es', 'th', 'tr'];

// Bulbapedia GO page columns: 0-based <td> index -> language code, plus the header text that
// column must carry. The header is checked on every run because Bulbapedia does insert columns:
// a Thai column appeared at index 11, which shifted ru/tr/id one to the right and silently wrote
// Thai move names into the Russian field for 319 moves. A hard failure beats that every time.
const BULBA_GO_COLUMNS = [
    [1, 'en', 'English'],
    [2, 'jp', 'Japanese'],
    [3, 'fr', 'French'],
    [4, 'de', 'German'],
    [5, 'es', 'European Spanish'],
    // 6: Latin American Spanish — skipped
    [7, 'it', 'Italian'],
    [8, 'kr', 'Korean'],
    [9, 'zhhant', 'Chinese Traditional'],
    [10, 'pt', 'Brazilian Portuguese'],
    [11, 'th', 'Thai'],
    [12, 'ru', 'Russian'],
    [13, 'tr', 'Turkish'],
    [14, 'id', 'Indonesian'],
    [15, 'hi', 'Hindi'],
];

const BULBA_GO_COL_MAP = Object.fromEntries(BULBA_GO_COLUMNS.map(([col, lang]) => [col, lang]));

// Bulbapedia general page columns, same shape and same header check.
const BULBA_GENERAL_COLUMNS = [
    [1, 'en', 'English'],
    [2, 'jp', 'Kana'],
    // 3: Rōmaji — skipped
    [4, 'fr', 'French'],
    [5, 'de', 'German'],
    [6, 'it', 'Italian'],
    [7, 'es', 'Spanish'],
    [8, 'kr', 'Hangul'],
    // 9: Korean romanization — skipped
    [10, 'zhhant', 'Hànzì'],
    // 11: Chinese romanization — skipped
];

const BULBA_GENERAL_COL_MAP = Object.fromEntries(
    BULBA_GENERAL_COLUMNS.map(([col, lang]) => [col, lang]),
);

// Languages on neither Bulbapedia page — preserve from existing data. The GO page carries Thai
// and Hindi as of 2026, so this is empty; anything listed here skips the scrape entirely.
const BULBA_MISSING_LANGS = new Set();

const FETCH_HEADERS = { 'User-Agent': 'DracovizBot/1.0 (move data updater)' };

// --- Fetch Functions ---

/**
 * Aborts if a table's header row no longer matches the columns we read by position. Bulbapedia
 * adds language columns from time to time, and without this the run happily files every
 * translation one column to the left.
 */
function assertColumns($, table, columns, label) {
    const headerRow = $(table).find('tr').filter((_, row) => $(row).find('th').length > 1).first();
    if (!headerRow.length) throw new Error(`${label}: could not find a header row to check`);

    const headers = headerRow.find('th').map((_, cell) => $(cell).text().trim()).get();
    // A table that simply stops early (some generation tables carry no Chinese) is fine: that
    // language is absent, not misfiled. Only a column holding something else is dangerous.
    const moved = columns.filter(([col, , expected]) => col < headers.length && headers[col] !== expected);
    if (!moved.length) return;

    const detail = moved
        .map(([col, lang, expected]) => `    column ${col} (${lang}): expected "${expected}", found "${headers[col]}"`)
        .join('\n');
    throw new Error(
        `${label}: the page's columns have moved, so translations would be stored under the wrong `
        + `languages.\n  Update the column table at the top of this file to match the page.\n${detail}`
        + `\n  page headers: ${headers.join(' | ')}`,
    );
}

async function fetchPvPokeData() {
    console.log('Fetching PvPoke moves...');
    const res = await fetch(PVPOKE_URL);
    if (!res.ok) throw new Error(`PvPoke fetch failed: ${res.status}`);
    const arr = await res.json();

    // PvPoke returns an array — convert to object keyed by moveId
    const data = {};
    for (const move of arr) {
        if (move.moveId) {
            data[move.moveId] = move;
        }
    }

    console.log(`  Got ${Object.keys(data).length} PvPoke moves`);
    return data;
}

async function fetchBulbapediaGO() {
    console.log('Fetching Bulbapedia GO translations...');
    const res = await fetch(BULBAPEDIA_GO_URL, { headers: FETCH_HEADERS });
    if (!res.ok) throw new Error(`Bulbapedia GO fetch failed: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const translations = new Map();

    const goTable = $('table[border="1"].sortable.roundy').first();
    assertColumns($, goTable, BULBA_GO_COLUMNS, 'Bulbapedia GO page');

    $('table[border="1"].sortable.roundy tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length < 10) return;

        const entry = {};
        cells.each((colIdx, cell) => {
            const lang = BULBA_GO_COL_MAP[colIdx];
            if (lang) {
                entry[lang] = $(cell).text().trim().normalize('NFC');
            }
        });

        if (entry.en) {
            translations.set(entry.en.toLowerCase(), entry);
        }
    });

    console.log(`  Got ${translations.size} GO translations`);
    return translations;
}

async function fetchBulbapediaGeneral() {
    console.log('Fetching Bulbapedia general translations...');
    const res = await fetch(BULBAPEDIA_GENERAL_URL, { headers: FETCH_HEADERS });
    if (!res.ok) throw new Error(`Bulbapedia general fetch failed: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const translations = new Map();

    // Multiple generation tables, all with class "roundy sortable"
    $('table.roundy.sortable').each((i, table) => {
        assertColumns($, table, BULBA_GENERAL_COLUMNS, `Bulbapedia general page (table ${i})`);
    });

    $('table.roundy.sortable tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length < 8) return;

        const entry = {};
        cells.each((colIdx, cell) => {
            const lang = BULBA_GENERAL_COL_MAP[colIdx];
            if (lang) {
                let text = $(cell).text().trim().normalize('NFC');
                // Chinese column may have Traditional / Simplified split — take first part
                if (lang === 'zhhant' && text.includes('/')) {
                    text = text.split('/')[0].trim();
                }
                entry[lang] = text;
            }
        });

        if (entry.en) {
            translations.set(entry.en.toLowerCase(), entry);
        }
    });

    console.log(`  Got ${translations.size} general translations`);
    return translations;
}

// --- Mapping Helpers ---

function getMoveEnglishName(moveId, pvpokeData) {
    const move = pvpokeData[moveId];
    if (move?.name) return move.name;
    // Derive from ID: ACID_SPRAY -> Acid Spray
    return moveId
        .replace(/[_]/g, ' ')
        .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function getBaseMoveId(moveId) {
    return moveId.replace(/\++$/, '');
}

function getSuffix(moveId) {
    const match = moveId.match(/(\++)$/);
    return match ? match[1] : '';
}

// --- Build Output ---

function buildMoveData(pvpokeData, existingMoveData) {
    const result = {};

    // Add all non-unlisted PvPoke moves
    for (const [moveId, move] of Object.entries(pvpokeData)) {
        if (move.unlisted) continue;
        result[moveId] = {
            moveId: moveId,
            type: move.type,
        };
    }

    // Preserve custom local entries not in PvPoke
    for (const [moveId, entry] of Object.entries(existingMoveData)) {
        if (!result[moveId]) {
            result[moveId] = entry;
        }
    }

    // Sort alphabetically
    const sorted = {};
    for (const key of Object.keys(result).sort()) {
        sorted[key] = result[key];
    }
    return sorted;
}

function resolveTranslations(moveId, pvpokeData, goMap, generalMap, existingMoves) {
    const suffix = getSuffix(moveId);
    const baseId = getBaseMoveId(moveId);
    const existing = existingMoves[moveId];

    // Get English name for lookup
    const englishName = getMoveEnglishName(baseId, pvpokeData);
    const key = englishName.toLowerCase();
    const goEntry = goMap.get(key);
    const generalEntry = generalMap.get(key);

    const translations = {};
    for (const lang of LANG_ORDER) {
        if (BULBA_MISSING_LANGS.has(lang)) {
            // Not on either page: preserve existing, fallback to English
            translations[lang] = existing?.[lang] || (englishName + suffix);
        } else if (goEntry?.[lang]) {
            // Priority 1: GO-specific translations (most accurate for Pokemon GO)
            translations[lang] = goEntry[lang] + suffix;
        } else if (generalEntry?.[lang]) {
            // Priority 2: General move translations (wider coverage)
            translations[lang] = generalEntry[lang] + suffix;
        } else if (existing?.[lang]) {
            // Priority 3: Preserve existing translations
            translations[lang] = existing[lang];
        } else {
            // Fallback: English name
            translations[lang] = englishName + suffix;
        }
    }

    return translations;
}

function buildMoves(pvpokeData, goMap, generalMap, existingMoves, moveData) {
    const result = {};

    // Collect all move IDs that need translations
    const moveIds = new Set([
        ...Object.keys(existingMoves),
        ...Object.keys(moveData),
    ]);

    for (const moveId of moveIds) {
        result[moveId] = resolveTranslations(moveId, pvpokeData, goMap, generalMap, existingMoves);
    }

    // Sort alphabetically
    const sorted = {};
    for (const key of Object.keys(result).sort()) {
        sorted[key] = result[key];
    }
    return sorted;
}

// --- Validation ---

function validate(moveData, moves) {
    const errors = [];

    if (Object.keys(moveData).length < 300) {
        errors.push(`moveData.json has only ${Object.keys(moveData).length} entries (expected 300+)`);
    }
    if (Object.keys(moves).length < 280) {
        errors.push(`moves.json has only ${Object.keys(moves).length} entries (expected 280+)`);
    }

    for (const [moveId, entry] of Object.entries(moves)) {
        for (const lang of LANG_ORDER) {
            if (!entry[lang]) {
                errors.push(`moves.json: ${moveId} missing language '${lang}'`);
            }
        }
    }

    return errors;
}

// --- Main ---

async function main() {
    // Read existing files
    const existingMoveData = JSON.parse(fs.readFileSync(MOVE_DATA_PATH, 'utf-8'));
    const existingMoves = JSON.parse(fs.readFileSync(MOVES_PATH, 'utf-8'));

    console.log(`Existing moveData.json: ${Object.keys(existingMoveData).length} entries`);
    console.log(`Existing moves.json: ${Object.keys(existingMoves).length} entries`);

    // Fetch all sources in parallel
    const [pvpokeData, goMap, generalMap] = await Promise.all([
        fetchPvPokeData(),
        fetchBulbapediaGO(),
        fetchBulbapediaGeneral(),
    ]);

    // Build outputs
    const newMoveData = buildMoveData(pvpokeData, existingMoveData);
    const newMoves = buildMoves(pvpokeData, goMap, generalMap, existingMoves, newMoveData);

    // Validate
    const errors = validate(newMoveData, newMoves);
    if (errors.length > 0) {
        console.error('\nValidation errors:');
        errors.forEach(e => console.error(`  - ${e}`));
        process.exit(1);
    }

    // Write files
    fs.writeFileSync(MOVE_DATA_PATH, JSON.stringify(newMoveData, null, 4) + '\n');
    fs.writeFileSync(MOVES_PATH, JSON.stringify(newMoves, null, 4) + '\n');

    // Summary
    const addedMoveData = Object.keys(newMoveData).filter(k => !existingMoveData[k]);
    const addedMoves = Object.keys(newMoves).filter(k => !existingMoves[k]);
    const removedMoveData = Object.keys(existingMoveData).filter(k => !newMoveData[k]);
    const removedMoves = Object.keys(existingMoves).filter(k => !newMoves[k]);

    console.log(`\nResults:`);
    console.log(`  moveData.json: ${Object.keys(newMoveData).length} entries`);
    console.log(`  moves.json: ${Object.keys(newMoves).length} entries`);

    if (addedMoveData.length) console.log(`  New in moveData: ${addedMoveData.join(', ')}`);
    if (addedMoves.length) console.log(`  New in moves: ${addedMoves.join(', ')}`);
    if (removedMoveData.length) console.log(`  Removed from moveData: ${removedMoveData.join(', ')}`);
    if (removedMoves.length) console.log(`  Removed from moves: ${removedMoves.join(', ')}`);

    console.log('\nDone!');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
