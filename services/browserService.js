// services/browserService.js
const { chromium } = require("playwright");

const sessions = new Map();

/**
 * Create a new browser session
 */
async function createSession(sessionId) {
  if (sessions.has(sessionId)) {
    return sessions.get(sessionId);
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const session = {
    browser,
    context,
    page,
  };

  sessions.set(sessionId, session);

  console.log(`[SESSION CREATED] ${sessionId}`);

  return session;
}

/**
 * Get existing session
 */
function getSession(sessionId) {
  const session = sessions.get(sessionId);

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  return session;
}

/**
 * Navigate
 */
async function goto(sessionId, url) {
  const session = getSession(sessionId);
  await session.page.goto(url);
}

/**
 * Screenshot (FIX PRINCIPAL)
 */
async function takeScreenshot(sessionId, options = {}) {
  const session = getSession(sessionId);

  if (!session.page) {
    throw new Error("Page not initialized in session");
  }

  return await session.page.screenshot({
    fullPage: true,
    ...options,
  });
}

/**
 * Click element
 */
async function click(sessionId, selector) {
  const session = getSession(sessionId);
  await session.page.click(selector);
}

/**
 * Type text
 */
async function type(sessionId, selector, text) {
  const session = getSession(sessionId);
  await session.page.fill(selector, text);
}

/**
 * Close session
 */
async function closeSession(sessionId) {
  const session = sessions.get(sessionId);

  if (session) {
    await session.browser.close();
    sessions.delete(sessionId);
  }
}

module.exports = {
  createSession,
  getSession,
  goto,
  click,
  type,
  takeScreenshot,
  closeSession,
};