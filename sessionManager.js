const { chromium } = require("playwright");
const { v4: uuidv4 } = require("uuid");

const sessions = new Map();

/**
 * CREATE SESSION (TENANT SAFE)
 */
async function createSession(userId) {

    const sessionId = uuidv4();

    const browser = await chromium.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    });

    const context = await browser.newContext({
        viewport: {
            width: 1920,
            height: 1080
        }
    });

    const page = await context.newPage();

    sessions.set(sessionId, {
        userId,
        browser,
        context,
        page,
        createdAt: Date.now()
    });

    return sessionId;
}

/**
 * GET SESSION (VALIDATE TENANT)
 */
function getSession(sessionId, userId) {

    const session = sessions.get(sessionId);

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.userId !== userId) {
        throw new Error("Unauthorized session access");
    }

    return session;
}

/**
 * CLOSE SESSION
 */
async function closeSession(sessionId) {

    const session = sessions.get(sessionId);

    if (!session) return;

    await session.browser.close();

    sessions.delete(sessionId);
}

module.exports = {
    createSession,
    getSession,
    closeSession
};