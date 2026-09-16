/**
 * Analytics vocabulary for dracoviz-tournaments.
 *
 * Design rule: MANY event names, ONE small shared parameter set.
 *
 * GA4 caps a property at 50 event-scoped and 25 user-scoped custom dimensions,
 * and each event at 25 parameters. Bespoke parameter names per event would blow
 * through that budget and leave most of the data unreportable, so every event
 * below draws its parameters from PARAM.
 *
 * Every param listed in PARAM must be registered in
 * GA4 Admin -> Custom definitions, or it will not appear in reports.
 * Registration is NOT retroactive.
 */

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------

export const SCREEN = Object.freeze({
  HOME: 'home',
  LOGIN: 'login',
  CREATE_TOURNAMENT: 'create_tournament',
  CREATE_COLLECTION: 'create_collection',
  JOIN_TOURNAMENT: 'join_tournament',
  MY_TEAMS: 'my_teams',
  USAGE: 'usage',
  TOURNAMENT_HUB: 'tournament_hub',
  TEAM_REGISTER: 'team_register',
  CAPTAIN: 'captain',
  MATCHUP: 'matchup',
  COLLECTION: 'collection',
  NOT_FOUND: 'not_found',
  ERROR: 'error',
  UNKNOWN: 'unknown',
});

/**
 * Next.js route pattern -> canonical screen key.
 *
 * `router.pathname` is already the route pattern with no locale prefix
 * (`/tournament/[id]`, never `/en/tournament/abc123`), which is exactly the
 * normalization that makes the GA4 Pages report readable.
 */
const SCREEN_BY_PATHNAME = Object.freeze({
  '/': SCREEN.HOME,
  '/login': SCREEN.LOGIN,
  '/create-tournament': SCREEN.CREATE_TOURNAMENT,
  '/create-collection': SCREEN.CREATE_COLLECTION,
  '/join-tournament': SCREEN.JOIN_TOURNAMENT,
  '/my-teams': SCREEN.MY_TEAMS,
  '/usage': SCREEN.USAGE,
  '/tournament/[id]': SCREEN.TOURNAMENT_HUB,
  '/team/[session]': SCREEN.TEAM_REGISTER,
  '/captain/[session]': SCREEN.CAPTAIN,
  '/matchup/[session]': SCREEN.MATCHUP,
  '/collection/[slug]': SCREEN.COLLECTION,
  '/404': SCREEN.NOT_FOUND,
  '/_error': SCREEN.ERROR,
});

const SCREEN_TITLES = Object.freeze({
  [SCREEN.HOME]: 'Home',
  [SCREEN.LOGIN]: 'Login',
  [SCREEN.CREATE_TOURNAMENT]: 'Create Tournament',
  [SCREEN.CREATE_COLLECTION]: 'Create Collection',
  [SCREEN.JOIN_TOURNAMENT]: 'Join Tournament',
  [SCREEN.MY_TEAMS]: 'My Teams',
  [SCREEN.USAGE]: 'Usage Stats',
  [SCREEN.TOURNAMENT_HUB]: 'Tournament',
  [SCREEN.TEAM_REGISTER]: 'Register Team',
  [SCREEN.CAPTAIN]: 'Captain Roster',
  [SCREEN.MATCHUP]: 'Matchup',
  [SCREEN.COLLECTION]: 'Collection',
  [SCREEN.NOT_FOUND]: 'Not Found',
  [SCREEN.ERROR]: 'Error',
  [SCREEN.UNKNOWN]: 'Unknown',
});

export function screenForPathname(pathname) {
  return SCREEN_BY_PATHNAME[pathname] ?? SCREEN.UNKNOWN;
}

export function titleForScreen(screen) {
  return SCREEN_TITLES[screen] ?? 'Unknown';
}

// ---------------------------------------------------------------------------
// Shared parameter vocabulary
// ---------------------------------------------------------------------------

export const PARAM = Object.freeze({
  SCREEN: 'screen',
  LOCALE: 'locale',
  ROLE: 'role',
  TOURNAMENT_ID: 'tournament_id',
  BRACKET_TYPE: 'bracket_type',
  TOURNAMENT_STATE: 'tournament_state',
  IS_TEAM_TOURNAMENT: 'is_team_tournament',
  META: 'meta',
  SOURCE: 'source',
  RESULT: 'result',
  ERROR_CODE: 'error_code',
  ITEM_COUNT: 'item_count',
  DURATION_MS: 'duration_ms',
  SPECIES_ID: 'species_id',
  ENDPOINT: 'endpoint',
  RAW_PATH: 'raw_path',
  CONFIG_FLAGS: 'config_flags',
  METHOD: 'method',
  PROVIDER: 'provider',
  IS_NEW_USER: 'is_new_user',
  ROUND_INDEX: 'round_index',
  QUERY_LENGTH: 'query_length',
  FIELD_COUNT: 'field_count',
  METRIC: 'metric',
  SORT_COLUMN: 'sort_column',
  SAVED_TO_LIBRARY: 'saved_to_library',
  TO_STATE: 'to_state',
});

export const ROLE = Object.freeze({
  HOST: 'host',
  PLAYER: 'player',
  CAPTAIN: 'captain',
  SPECTATOR: 'spectator',
  GUEST: 'guest',
});

export const RESULT = Object.freeze({
  SUCCESS: 'success',
  FAILURE: 'failure',
  CANCELLED: 'cancelled',
});

export const SOURCE = Object.freeze({
  DEEP_LINK: 'deep_link',
  MANUAL: 'manual',
  AUTO: 'auto',
  NAV: 'nav',
  CTA: 'cta',
  PRESET: 'preset',
  // tournament presets
  PRESET_PLAY_POKEMON: 'play_pokemon',
  PRESET_CANDLE_PRACTICE: 'candle_practice',
  PRESET_FLASH_PRACTICE: 'flash_practice',
  // share targets
  SHARE_TOURNAMENT: 'tournament',
  SHARE_TEAM_INVITE: 'team_invite',
  // export targets
  EXPORT_PLAYERS: 'players',
  EXPORT_FULL: 'full',
  EXPORT_USAGE: 'usage',
  // external links
  LINK_BRACKET: 'bracket',
  LINK_DISCORD: 'discord',
  LINK_TWITCH: 'twitch',
  LINK_KOFI: 'kofi',
});

export const USER_PROP = Object.freeze({
  IS_HOST: 'is_host',
  TOURNAMENTS_HOSTED: 'tournaments_hosted',
  TOURNAMENTS_PLAYED: 'tournaments_played',
  HAS_SAVED_TEAMS: 'has_saved_teams',
  APP_LOCALE: 'app_locale',
  THEME: 'theme',
});

// ---------------------------------------------------------------------------
// Event names
// ---------------------------------------------------------------------------

export const EVENT = Object.freeze({
  // --- navigation -----------------------------------------------------------
  PAGE_VIEW: 'page_view',
  ROUTE_TRANSITION: 'route_transition',
  NAV_CLICKED: 'nav_clicked',
  EXTERNAL_LINK_CLICKED: 'external_link_clicked',

  // --- auth -----------------------------------------------------------------
  LOGIN_SUCCEEDED: 'login_succeeded',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  AUTH_GATE_REDIRECT: 'auth_gate_redirect',

  // --- tournament creation (TO funnel) --------------------------------------
  TOURNAMENT_PRESET_APPLIED: 'tournament_preset_applied',
  TOURNAMENT_CREATE_SUBMITTED: 'tournament_create_submitted',
  TOURNAMENT_CREATED: 'tournament_created',
  TOURNAMENT_CREATE_FAILED: 'tournament_create_failed',
  COLLECTION_CREATED: 'collection_created',

  // --- joining (player funnel) ----------------------------------------------
  JOIN_SUBMITTED: 'join_submitted',
  JOINED_TOURNAMENT: 'joined_tournament',
  JOIN_FAILED: 'join_failed',
  ALREADY_ENTERED: 'already_entered',
  FACTION_CREATED: 'faction_created',
  FACTION_JOINED: 'faction_joined',

  // --- tournament hub -------------------------------------------------------
  TOURNAMENT_VIEWED: 'tournament_viewed',
  BRACKET_STARTED: 'bracket_started',
  BRACKET_PROGRESSED: 'bracket_progressed',
  BRACKET_REVERTED: 'bracket_reverted',
  TOURNAMENT_STATE_CHANGED: 'tournament_state_changed',
  TOURNAMENT_CONCLUDED: 'tournament_concluded',
  TOURNAMENT_UNCONCLUDED: 'tournament_unconcluded',
  PLAYER_KICKED: 'player_kicked',
  TOURNAMENT_DELETED: 'tournament_deleted',
  TOURNAMENT_LEFT: 'tournament_left',
  HOST_ADDED: 'host_added',
  TOURNAMENT_EDITED: 'tournament_edited',

  // --- matchups / reporting -------------------------------------------------
  REPORT_MODAL_OPENED: 'report_modal_opened',
  SCORE_REPORTED: 'score_reported',

  // --- team building --------------------------------------------------------
  TEAM_REGISTER_VIEWED: 'team_register_viewed',
  TEAM_REGISTERED: 'team_registered',
  TEAM_REGISTER_FAILED: 'team_register_failed',
  SAVED_TEAM_LOADED: 'saved_team_loaded',
  SAVED_TEAM_SAVED: 'saved_team_saved',
  SAVED_TEAM_DELETED: 'saved_team_deleted',
  ROSTER_SAVED: 'roster_saved',
  PVPOKE_DIALOG_OPENED: 'pvpoke_dialog_opened',
  PVPOKE_IMPORT_SUCCEEDED: 'pvpoke_import_succeeded',
  PVPOKE_IMPORT_FAILED: 'pvpoke_import_failed',
  PVPOKE_EXPORT_COPIED: 'pvpoke_export_copied',
  GAMEMASTER_LOADED: 'gamemaster_loaded',

  // --- usage stats ----------------------------------------------------------
  USAGE_LOADED: 'usage_loaded',
  USAGE_ACCESS_DENIED: 'usage_access_denied',
  USAGE_SPECIES_DRILLDOWN: 'usage_species_drilldown',
  USAGE_METRIC_CHANGED: 'usage_metric_changed',
  USAGE_TABLE_SORTED: 'usage_table_sorted',
  USAGE_LOAD_OLDER: 'usage_load_older',

  // --- sharing / exports ----------------------------------------------------
  SHARE_LINK_COPIED: 'share_link_copied',
  EXPORT_MENU_OPENED: 'export_menu_opened',
  EXPORT_DOWNLOADED: 'export_downloaded',
  TEAM_SHEETS_OPENED: 'team_sheets_opened',
  TEAM_SHEETS_PRINTED: 'team_sheets_printed',

  // --- discovery / settings -------------------------------------------------
  PLAYER_SEARCH: 'player_search',
  TOURNAMENT_SEARCH: 'tournament_search',
  HOME_TAB_SWITCHED: 'home_tab_switched',
  SHOW_ALL_TOURNAMENTS: 'show_all_tournaments',
  PLAYER_PROFILE_VIEWED: 'player_profile_viewed',
  PROFILE_EDIT_OPENED: 'profile_edit_opened',
  PROFILE_SAVED: 'profile_saved',
  LOCALE_CHANGED: 'locale_changed',
  THEME_TOGGLED: 'theme_toggled',

  // --- infrastructure -------------------------------------------------------
  API_ERROR: 'api_error',
  API_SLOW: 'api_slow',
});
