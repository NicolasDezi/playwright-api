/**
 * ==========================================================
 * SESSION LOGGER (OBSERVABILITY CORE)
 * ==========================================================
 */

const logs = new Map();

/**
 * INIT SESSION LOG
 */
function initSessionLog(sessionId) {
    logs.set(sessionId, []);
}

/**
 * PUSH LOG EVENT
 */
function log(sessionId, event) {

    if (!logs.has(sessionId)) {
        logs.set(sessionId, []);
    }

    logs.get(sessionId).push({
        timestamp: Date.now(),
        ...event
    });
}

/**
 * GET LOGS
 */
function getLogs(sessionId) {
    return logs.get(sessionId) || [];
}

/**
 * CLEAR LOGS
 */
function clearLogs(sessionId) {
    logs.delete(sessionId);
}

module.exports = {
    initSessionLog,
    log,
    getLogs,
    clearLogs
};