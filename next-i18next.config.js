const path = require('path');

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'default',
    locales: ['default', 'en', 'es', 'jp', 'pt'],
    localePath: path.resolve('./public/locales'),
    localeDetection: false,
  },
}