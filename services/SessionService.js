const { chromium } = require("playwright");
const { v4: uuidv4 } = require("uuid");

const config = require("../config/config");
const db = require("../db/connection");

/**
 * ==========================================================
 * RUNTIME STORE (RAM)
 * ==========================================================
 * Mantiene sesiones activas en memoria para performance
 */
const runtimeSessions = new Map();

/**
 * Control de límite de sesiones activas
 */
const activeSessions = new Set();

/**
 * ==========================================================
 * CREATE SESSION
 * ==========================================================
 */
async function create() {

    if (activeSessions.size >= config.session.maxSessions) {
        throw new Error("Max sessions limit reached");
    }

    const sessionId = uuidv4();

    /**
     * Launch browser (production safe flags)
     */
    const browser = await chromium.launch({
        headless: config.playwright.headless,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-zygote",
            "--single-process"
        ]
    });

    const context = await browser.newContext({
        viewport: config.playwright.viewport
    });

    const page = await context.newPage();

    /**
     * Store in memory
     */
    runtimeSessions.set(sessionId, {
        browser,
        context,
        page,
        createdAt: Date.now()
    });

    activeSessions.add(sessionId);

    /**
     * Persist in DB
     */
    await db.query(
        `INSERT INTO sessions (id, status, created_at)
         VALUES ($1, $2, NOW())`,
        [sessionId, "active"]
    );

    console.log(`[SESSION CREATED] ${sessionId}`);

    return sessionId;
}

/**
 * ==========================================================
 * GET SESSION
 * ==========================================================
 */
function get(sessionId) {

    const session = runtimeSessions.get(sessionId);

    if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
    }

    return session;
}

/**
 * ==========================================================
 * CLOSE SESSION
 * ==========================================================
 */
async function close(sessionId) {

    const session = runtimeSessions.get(sessionId);

    if (!session) return;

    try {
        await session.browser.close();
    } catch (err) {
        console.error("[BROWSER CLOSE ERROR]", err.message);
    }

    runtimeSessions.delete(sessionId);
    activeSessions.delete(sessionId);

    /**
     * Update DB
     */
    await db.query(
        `UPDATE sessions
         SET status = $1,
             closed_at = NOW()
         WHERE id = $2`,
        ["closed", sessionId]
    );

    console.log(`[SESSION CLOSED] ${sessionId}`);
}

/**
 * ==========================================================
 * LIST ACTIVE SESSIONS
 * ==========================================================
 */
function list() {

    return Array.from(runtimeSessions.entries()).map(([id, session]) => ({
        id,
        createdAt: session.createdAt
    }));

}

/**
 * ==========================================================
 * GET SESSION COUNT
 * ==========================================================
 */
function count() {
    return activeSessions.size;
}

/**
 * ==========================================================
 * CLOSE ALL SESSIONS (EMERGENCY / SHUTDOWN)
 * ==========================================================
 */
async function closeAll() {

    for (const [sessionId] of runtimeSessions) {
        await close(sessionId);
    }

    console.log("[ALL SESSIONS CLOSED]");
}

module.exports = {

    create,
    get,
    close,
    list,
    count,
    closeAll

};