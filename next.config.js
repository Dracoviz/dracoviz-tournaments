const { i18n } = require('./next-i18next.config')
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API_HOST: process.env.API_HOST,
    API_KEY: process.env.API_KEY,
    GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
  },
  i18n,
};

module.exports = nextConfig;
