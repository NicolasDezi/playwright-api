const { chromium } = require("playwright");
const { v4: uuidv4 } = require("uuid");

const sessions = {};

async function createSession() {
    const sessionId = uuidv4();

    const browser = await chromium.launch({
        headless: process.env.HEADLESS !== "false",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    sessions[sessionId] = {
        browser,
        context,
        page,
        createdAt: Date.now()
    };

    return sessionId;
}

function getSession(sessionId) {
    return sessions[sessionId];
}

async function closeSession(sessionId) {
    const session = sessions[sessionId];

    if (session) {
        await session.browser.close();
        delete sessions[sessionId];
    }
}

function getPage(sessionId) {
    const session = sessions[sessionId];
    if (!session) throw new Error("Session not found");
    return session.page;
}

module.exports = {
    createSession,
    getSession,
    closeSession,
    getPage,
    sessions
};