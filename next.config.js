// next.config.js
module.exports = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_INTUIT_CLIENT_ID: process.env.NEXT_PUBLIC_INTUIT_CLIENT_ID,
    INTUIT_CLIENT_SECRET: process.env.INTUIT_CLIENT_SECRET,
    NEXT_PUBLIC_DEV_URL: process.env.NEXT_PUBLIC_DEV_URL,
    NEXT_PUBLIC_PROD_URL: process.env.NEXT_PUBLIC_PROD_URL,
  },
};