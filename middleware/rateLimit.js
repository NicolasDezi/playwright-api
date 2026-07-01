/**
 * ==========================================================
 * SIMPLE RATE LIMITER (IN-MEMORY)
 * ==========================================================
 */

const { AppError } = require("../utils/errors");

const requests = new Map();

function rateLimit(options = {}) {

    const windowMs = options.windowMs || 60000; // 1 min
    const max = options.max || 30;

    return (req, res, next) => {

        const ip = req.ip || "unknown";
        const now = Date.now();

        if (!requests.has(ip)) {
            requests.set(ip, []);
        }

        const timestamps = requests.get(ip);

        const filtered = timestamps.filter(ts => now - ts < windowMs);

        filtered.push(now);

        requests.set(ip, filtered);

        if (filtered.length > max) {
            throw new AppError("Too many requests", 429, "RATE_LIMIT");
        }

        next();
    };
}

module.exports = rateLimit;