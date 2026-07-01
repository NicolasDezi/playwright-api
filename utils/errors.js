/**
 * ==========================================================
 * CUSTOM ERROR CLASSES (PRODUCTION READY)
 * ==========================================================
 */

/**
 * Base error class
 */
class AppError extends Error {
    constructor(message, statusCode = 500, code = "APP_ERROR") {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Session not found
 */
class SessionNotFoundError extends AppError {
    constructor(sessionId) {
        super(`Session not found: ${sessionId}`, 404, "SESSION_NOT_FOUND");
        this.sessionId = sessionId;
    }
}

/**
 * Browser error
 */
class BrowserError extends AppError {
    constructor(message) {
        super(message || "Browser error occurred", 500, "BROWSER_ERROR");
    }
}

/**
 * Action execution error
 */
class ActionExecutionError extends AppError {
    constructor(action, message) {
        super(
            message || `Action failed: ${action?.type}`,
            500,
            "ACTION_ERROR"
        );

        this.action = action;
    }
}

/**
 * Timeout error
 */
class TimeoutError extends AppError {
    constructor(action, timeout) {
        super(
            `Timeout after ${timeout}ms`,
            408,
            "TIMEOUT_ERROR"
        );

        this.action = action;
        this.timeout = timeout;
    }
}

/**
 * Validation error
 */
class ValidationError extends AppError {
    constructor(message, field) {
        super(message, 400, "VALIDATION_ERROR");
        this.field = field;
    }
}

/**
 * Auth error
 */
class AuthError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401, "AUTH_ERROR");
    }
}

/**
 * Export all errors
 */
module.exports = {
    AppError,
    SessionNotFoundError,
    BrowserError,
    ActionExecutionError,
    TimeoutError,
    ValidationError,
    AuthError
};