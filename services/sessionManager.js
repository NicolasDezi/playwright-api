const { chromium } = require("playwright");
const crypto = require("crypto");

const sessions = new Map();

async function createSession() {
    const browser = await chromium.launch({
        headless: true
    });

    const context = await browser.newContext();

    const page = await context.newPage();

    const id = crypto.randomUUID();

    const session = {
        id,
        browser,
        context,
        page,
        createdAt: new Date(),
        lastActivity: new Date()
    };

    sessions.set(id, session);

    return session;
}

function getSession(id) {
    return sessions.get(id);
}

async function closeSession(id) {

    const session = sessions.get(id);

    if (!session) return false;

    try {

        await session.page.close();

    } catch {}

    try {

        await session.context.close();

    } catch {}

    try {

        await session.browser.close();

    } catch {}

    sessions.delete(id);

    return true;
}

function listSessions() {

    return [...sessions.values()].map(s => ({
        id: s.id,
        createdAt: s.createdAt,
        lastActivity: s.lastActivity
    }));

}

module.exports = {
    createSession,
    getSession,
    closeSession,
    listSessions
};