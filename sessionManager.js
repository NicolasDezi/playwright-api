const { chromium } = require("playwright");

const sessions = new Map();

/**
 * Crear sesión nueva
 */
async function createSession() {
    const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    const sessionId = generateId();

    sessions.set(sessionId, {
        browser,
        context,
        page,
        createdAt: Date.now()
    });

    return sessionId;
}

/**
 * Obtener page de sesión
 */
function getPage(sessionId) {
    const session = sessions.get(sessionId);

    if (!session) {
        throw new Error("Session not found");
    }

    return session.page;
}

/**
 * Cerrar sesión
 */
async function closeSession(sessionId) {
    const session = sessions.get(sessionId);

    if (!session) return;

    try {
        await session.browser.close();
    } catch (e) {}

    sessions.delete(sessionId);
}

/**
 * Generador simple de ID
 */
function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

module.exports = {
    createSession,
    getPage,
    closeSession,
    sessions
};