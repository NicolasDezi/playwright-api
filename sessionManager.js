const { chromium } = require("playwright");
const { v4: uuidv4 } = require("uuid");

const sessions = new Map();

/**
 * ===========================================================
 * CREATE SESSION
 * ===========================================================
 */
async function createSession() {

    const sessionId = uuidv4();

    const browser = await chromium.launch({

        headless: true,

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

        viewport: {
            width: 1920,
            height: 1080
        },

        deviceScaleFactor: 1

    });

    const page = await context.newPage();

    sessions.set(sessionId, {

        browser,
        context,
        page,
        createdAt: Date.now()

    });

    console.log(`[SESSION CREATED] ${sessionId}`);

    return sessionId;

}

/**
 * ===========================================================
 * GET SESSION
 * ===========================================================
 */
function getSession(sessionId) {

    const session = sessions.get(sessionId);

    if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
    }

    return session;

}

/**
 * ===========================================================
 * CLOSE SESSION
 * ===========================================================
 */
async function closeSession(sessionId) {

    const session = sessions.get(sessionId);

    if (!session) return;

    try {

        await session.browser.close();

    } catch (err) {

        console.error("Error closing browser:", err.message);

    }

    sessions.delete(sessionId);

    console.log(`[SESSION CLOSED] ${sessionId}`);

}

module.exports = {

    createSession,
    getSession,
    closeSession

};