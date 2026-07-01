/**
 * ==========================================================
 * LOGGER MIDDLEWARE (PRODUCTION READY)
 * ==========================================================
 */

const config = require("../config/config");

/**
 * Format timestamp
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Simple log printer
 */
function log(level, message, data = {}) {
    const timestamp = getTimestamp();

    const logEntry = {
        timestamp,
        level,
        message,
        ...data
    };

    if (level === "error") {
        console.error(JSON.stringify(logEntry));
    } else if (level === "warn") {
        console.warn(JSON.stringify(logEntry));
    } else {
        console.log(JSON.stringify(logEntry));
    }
}

/**
 * Express middleware
 */
function logger(req, res, next) {
    if (!config.logging.requests) {
        return next();
    }

    const start = Date.now();

    const { method, originalUrl } = req;

    log("info", "REQUEST_IN", {
        method,
        url: originalUrl,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    });

    res.on("finish", () => {
        const duration = Date.now() - start;

        log("info", "REQUEST_OUT", {
            method,
            url: originalUrl,
            statusCode: res.statusCode,
            durationMs: duration
        });
    });

    next();
}

/**
 * Action logger (Playwright steps)
 */
function logAction(sessionId, action, status, extra = {}) {
    if (!config.logging.actions) return;

    log("info", "ACTION", {
        sessionId,
        action,
        status,
        ...extra
    });
}

/**
 * Error logger
 */
function logError(error, context = {}) {
    log("error", error.message || "Unknown error", {
        stack: error.stack,
        ...context
    });
}

module.exports = {
    logger,
    log,
    logAction,
    logError
};