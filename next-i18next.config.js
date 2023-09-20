import { resolve } from 'path';

/** @type {import('next-i18next').UserConfig} */
export const i18n = {
  defaultLocale: 'es',
  locales: ['en', 'es'],
  localePath: resolve('./public/locales'),
};