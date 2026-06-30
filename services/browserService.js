const { chromium } = require("playwright");

let browser = null;
let context = null;
let page = null;

async function launchBrowser() {
    if (!browser) {
        browser = await chromium.launch({
            headless: process.env.HEADLESS !== "false",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        context = await browser.newContext();
        page = await context.newPage();
    }

    return { browser, context, page };
}

async function getPage() {
    if (!page) {
        await launchBrowser();
    }
    return page;
}

async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
        context = null;
        page = null;
    }
}

module.exports = {
    launchBrowser,
    getPage,
    closeBrowser
};