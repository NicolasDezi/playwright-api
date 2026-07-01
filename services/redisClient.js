/**
 * ==========================================================
 * REDIS CLIENT (PRODUCTION READY)
 * ==========================================================
 */

const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false
});

redis.on("connect", () => {
    console.log("[REDIS] Connected");
});

redis.on("error", (err) => {
    console.error("[REDIS ERROR]", err.message);
});

module.exports = redis;