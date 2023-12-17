const path = require('path');

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'default',
    locales: ['default', 'en', 'es', 'jp', 'kr', 'th', 'pt', 'it'],
    localePath: path.resolve('./public/locales'),
    localeDetection: false,
  },
}