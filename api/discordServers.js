/**
 * Community Discord servers promoted on the join page.
 *
 * `name` is deliberately NOT a translation key: these are the servers' real
 * names and are how people search for them, so they read identically in every
 * locale. Only `descriptionKey` and `languageKey` go through i18n.
 *
 * `languageKey` is null when a server has no language requirement.
 *
 * The icon URLs are Discord's CDN with `size=256` rather than the 2048 the
 * server settings page hands out -- these render at 72px, and four 2048px
 * webps would be megabytes of avatar on a page people hit on phones.
 */
const discordServers = [
  {
    id: "candle_cult",
    name: "Candle Cult",
    inviteUrl: "https://discord.gg/aptvx5CYFr",
    logoUrl: "https://cdn.discordapp.com/icons/732338061622509670/5a70a44370c4afd11a20c6e5aa377187.webp?size=256",
    descriptionKey: "discord_candle_cult_description",
    languageKey: "discord_requires_english",
  },
  {
    id: "flash_tournaments",
    name: "Flash Tournaments for Everyone",
    inviteUrl: "https://discord.gg/QmhfxgYBw5",
    logoUrl: "https://cdn.discordapp.com/icons/744241283341746267/6799cd1cabc49c27f1907adc29892c11.webp?size=256",
    descriptionKey: "discord_flash_description",
    languageKey: "discord_requires_english",
  },
  {
    id: "asia_pacific",
    name: "Asia Pacific Championships",
    inviteUrl: "https://discord.gg/M9eKHsUG7c",
    logoUrl: "https://cdn.discordapp.com/icons/1162761705827340429/fcfe7452afaca9470b2d3e9a487bcf5a.webp?size=256",
    descriptionKey: "discord_asia_pacific_description",
    languageKey: null,
  },
  {
    id: "espeon_practice",
    name: "エーフィとスパトレ",
    inviteUrl: "https://discord.gg/awwuqEyBuD",
    logoUrl: "https://cdn.discordapp.com/icons/1421378102893871167/92998103dd8d3895315519defa7c49ec.webp?size=256",
    descriptionKey: "discord_espeon_description",
    languageKey: "discord_requires_japanese",
  },
];

export default discordServers;
