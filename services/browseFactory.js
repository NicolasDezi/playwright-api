/**
 * ==========================================================
 * BROWSER FACTORY (PRODUCTION READY)
 * ==========================================================
 * Handles Chromium creation for Docker / EasyPanel
 * ==========================================================
 */

const { chromium } = require("playwright");
const config = require("../config/config");

/**
 * Launch a new browser instance
 */
async function launchBrowser() {
    try {
        const browser = await chromium.launch({
            headless: config.playwright.headless,
            args: config.chromium.launchOptions.args
        });

        return browser;

    } catch (error) {
        console.error("[BROWSER_FACTORY] launchBrowser error:", error);
        throw error;
    }
}

/**
 * Create a new browser context (isolated session)
 */
async function createContext(browser) {
    try {
        const context = await browser.newContext({
            viewport: config.playwright.viewport,
            deviceScaleFactor: config.playwright.deviceScaleFactor,
            ignoreHTTPSErrors: config.playwright.ignoreHTTPSErrors,
            acceptDownloads: config.playwright.acceptDownloads,
            locale: config.playwright.locale,
            timezoneId: config.playwright.timezone,
            userAgent: config.playwright.userAgent
        });

        return context;

    } catch (error) {
        console.error("[BROWSER_FACTORY] createContext error:", error);
        throw error;
    }
}

/**
 * Create a new page with safe defaults
 */
async function createPage(context) {
    try {
        const page = await context.newPage();

        // Improve stability in Docker environments
        page.setDefaultTimeout(config.playwright.timeout);
        page.setDefaultNavigationTimeout(config.playwright.navigationTimeout);

        // Block unnecessary resources (optional optimization)
        await page.route("**/*", (route) => {
            const request = route.request();

            const blockedResources = [
                "image",
                "font"
            ];

            if (blockedResources.includes(request.resourceType())) {
                return route.abort();
            }

            route.continue();
        });

        return page;

    } catch (error) {
        console.error("[BROWSER_FACTORY] createPage error:", error);
        throw error;
    }
}

/**
 * Full browser session factory
 */
async function createBrowserSession() {
    const browser = await launchBrowser();
    const context = await createContext(browser);
    const page = await createPage(context);

    return {
        browser,
        context,
        page
    };
}

/**
 * Graceful browser close
 */
async function closeBrowser(browser) {
    try {
        if (browser) {
            await browser.close();
        }
    } catch (error) {
        console.error("[BROWSER_FACTORY] closeBrowser error:", error);
    }
}

module.exports = {
    launchBrowser,
    createContext,
    createPage,
    createBrowserSession,
    closeBrowser
};