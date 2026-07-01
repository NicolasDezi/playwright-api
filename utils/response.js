/**
 * ==========================================================
 * RESPONSE UTILITIES (PRODUCTION READY)
 * ==========================================================
 * Standard API responses for Express
 * ==========================================================
 */

/**
 * Success response
 */
function success(res, data = {}, message = "OK") {
    return res.status(200).json({
        ok: true,
        message,
        ...data
    });
}

/**
 * Created response
 */
function created(res, data = {}, message = "Created") {
    return res.status(201).json({
        ok: true,
        message,
        ...data
    });
}

/**
 * Bad request
 */
function badRequest(res, error = "Bad Request") {
    return res.status(400).json({
        ok: false,
        error
    });
}

/**
 * Unauthorized
 */
function unauthorized(res, error = "Unauthorized") {
    return res.status(401).json({
        ok: false,
        error
    });
}

/**
 * Not found
 */
function notFound(res, error = "Not Found") {
    return res.status(404).json({
        ok: false,
        error
    });
}

/**
 * Server error
 */
function serverError(res, error = "Internal Server Error") {
    return res.status(500).json({
        ok: false,
        error: error?.message || error
    });
}

/**
 * Custom response (full control)
 */
function custom(res, statusCode, payload = {}) {
    return res.status(statusCode).json(payload);
}

module.exports = {
    success,
    created,
    badRequest,
    unauthorized,
    notFound,
    serverError,
    custom
};