/**
 * ==========================================================
 * API KEY AUTH MIDDLEWARE (PRODUCTION READY)
 * ==========================================================
 */

const { AppError } = require("../utils/errors");

function authMiddleware(req, res, next) {

    const apiKey = req.headers["x-api-key"];

    const validKey = process.env.API_KEY;

    if (!validKey) {
        console.warn("[AUTH WARNING] API_KEY not set in env");
        return next();
    }

    if (!apiKey) {
        throw new AppError("Missing API key", 401, "AUTH_MISSING_KEY");
    }

    if (apiKey !== validKey) {
        throw new AppError("Invalid API key", 403, "AUTH_INVALID_KEY");
    }

    next();
}

module.exports = authMiddleware;