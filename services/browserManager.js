const { chromium } = require("playwright");

const config = require("../config/config");

async function launchBrowser() {

    console.log("Launching Chromium...");

    const browser = await chromium.launch(

        config.browser.launchOptions

    );

    return browser;

}

async function createContext(browser) {

    const context = await browser.newContext({

        viewport: config.context.viewport,

        deviceScaleFactor:
            config.context.deviceScaleFactor,

        locale:
            config.context.locale,

        timezoneId:
            config.context.timezoneId,

        ignoreHTTPSErrors:
            config.context.ignoreHTTPSErrors,

        acceptDownloads:
            config.context.acceptDownloads,

        recordVideo: {

            dir: config.folders.videos,

            size: config.context.viewport

        }

    });

    return context;

}

async function createPage(context) {

    const page = await context.newPage();

    page.setDefaultNavigationTimeout(

        config.timeouts.navigation

    );

    page.setDefaultTimeout(

        config.timeouts.action

    );

    page.on("console", msg => {

        console.log(
            "[BROWSER]",
            msg.type(),
            msg.text()
        );

    });

    page.on("pageerror", err => {

        console.error(
            "[PAGE ERROR]",
            err.message
        );

    });

    page.on("requestfailed", req => {

        console.error(
            "[REQUEST FAILED]",
            req.url()
        );

    });

    return page;

}

module.exports = {

    launchBrowser,

    createContext,

    createPage

};