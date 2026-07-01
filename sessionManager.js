const crypto = require("crypto");
const { chromium } = require("playwright");
const db = require("./db");

const sessions = new Map();

async function createSession(userId) {

    const id = crypto.randomUUID();

    const browser = await chromium.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-dev-shm-usage"
        ]
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    sessions.set(id, { browser, context, page, userId });

    await db.query(
        `INSERT INTO sessions (id, user_id, created_at)
         VALUES ($1, $2, $3)`,
        [id, userId, Date.now()]
    );

    return id;
}

function getSession(id, userId) {

    const session = sessions.get(id);

    if (!session) throw new Error("Session not found");

    if (session.userId !== userId)
        throw new Error("Unauthorized");

    return session;
}

async function closeSession(id) {

    const session = sessions.get(id);

    if (!session) return;

    await session.browser.close();

    sessions.delete(id);
}

module.exports = {
    createSession,
    getSession,
    closeSession
};