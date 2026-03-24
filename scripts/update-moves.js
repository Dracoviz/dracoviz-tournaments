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

// Bulbapedia GO page column index (0-based <td>) -> language code
// Columns: Index(0) | English(1) | Japanese(2) | French(3) | German(4) | Spanish(5) | Spanish LA(6) | Italian(7) | Korean(8) | Chinese Trad(9) | Brazilian Portuguese(10) | Russian(11) | Turkish(12) | Indonesian(13)
const BULBA_GO_COL_MAP = {
    1: 'en',
    2: 'jp',
    3: 'fr',
    4: 'de',
    5: 'es',
    // 6: Spanish (Latin America) — skipped
    7: 'it',
    8: 'kr',
    9: 'zhhant',
    10: 'pt',
    11: 'ru',
    12: 'tr',
    13: 'id',
};

// Bulbapedia general page column index (0-based <td>) -> language code
// Columns: Index(0) | English(1) | Kana(2) | Rōmaji(3) | French(4) | German(5) | Italian(6) | Spanish(7) | Hangul(8) | Korean Romanization(9) | Chinese(10) | Chinese Romanization(11)
const BULBA_GENERAL_COL_MAP = {
    1: 'en',
    2: 'jp',
    // 3: Rōmaji — skipped
    4: 'fr',
    5: 'de',
    6: 'it',
    7: 'es',
    8: 'kr',
    // 9: Korean romanization — skipped
    10: 'zhhant',
    // 11: Chinese romanization — skipped
};

// Languages not available on either Bulbapedia page — preserve from existing data
const BULBA_MISSING_LANGS = new Set(['hi', 'th']);

const FETCH_HEADERS = { 'User-Agent': 'DracovizBot/1.0 (move data updater)' };

// --- Fetch Functions ---

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
            // Hindi/Thai: preserve existing, fallback to English
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
