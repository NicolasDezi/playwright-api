require("dotenv").config();

module.exports = {
  server: {
    host: process.env.HOST || "0.0.0.0",
    port: Number(process.env.PORT || 8080),
  },

  playwright: {
    headless: process.env.HEADLESS === "true",
    viewport: {
      width: Number(process.env.VIEWPORT_WIDTH || 1920),
      height: Number(process.env.VIEWPORT_HEIGHT || 1080),
    },
    navigationTimeout: Number(process.env.NAVIGATION_TIMEOUT || 60000),
    actionTimeout: Number(process.env.ACTION_TIMEOUT || 30000),
  },

  session: {
    ttl: Number(process.env.SESSION_TTL || 3600000),
    maxSessions: Number(process.env.MAX_SESSIONS || 20),
  },

  logLevel: process.env.LOG_LEVEL || "info",
};