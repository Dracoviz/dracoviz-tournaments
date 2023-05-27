/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API_HOST: process.env.API_HOST,
    API_KEY: process.env.API_KEY,
  }
};

module.exports = nextConfig;
