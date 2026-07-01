/**
 * ==========================================================
 * CONFIGURATION
 * Playwright Automation Engine
 * Production Ready
 * ==========================================================
 */

require("dotenv").config();

function toBool(value, defaultValue = false) {
    if (value === undefined || value === null) {
        return defaultValue;
    }

    return ["1", "true", "yes", "on"].includes(
        String(value).toLowerCase()
    );
}

function toInt(value, defaultValue) {
    const n = parseInt(value, 10);

    if (Number.isNaN(n)) {
        return defaultValue;
    }

    return n;
}

const config = {

    /**
     * ======================================================
     * SERVER
     * ======================================================
     */

    server: {

        host: process.env.HOST || "0.0.0.0",

        port: toInt(process.env.PORT, 8080),

        trustProxy: toBool(
            process.env.TRUST_PROXY,
            true
        )

    },

    /**
     * ======================================================
     * SECURITY
     * ======================================================
     */

    security: {

        apiKey:
            process.env.API_KEY || "",

        enableApiKey:
            toBool(
                process.env.ENABLE_API_KEY,
                false
            )

    },

    /**
     * ======================================================
     * PLAYWRIGHT
     * ======================================================
     */

    playwright: {

        headless: toBool(
            process.env.HEADLESS,
            true
        ),

        browser: process.env.BROWSER || "chromium",

        timeout: toInt(
            process.env.PLAYWRIGHT_TIMEOUT,
            60000
        ),

        navigationTimeout: toInt(
            process.env.NAVIGATION_TIMEOUT,
            60000
        ),

        viewport: {

            width: toInt(
                process.env.VIEWPORT_WIDTH,
                1920
            ),

            height: toInt(
                process.env.VIEWPORT_HEIGHT,
                1080
            )

        },

        deviceScaleFactor: 1,

        ignoreHTTPSErrors: true,

        acceptDownloads: true,

        locale: process.env.LOCALE || "en-US",

        timezone: process.env.TIMEZONE || "UTC",

        userAgent:
            process.env.USER_AGENT ||

            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/138.0 Safari/537.36"

    },

    /**
     * ======================================================
     * CHROMIUM FLAGS
     * ======================================================
     */

    chromium: {

        launchOptions: {

            headless: true,

            args: [

                "--no-sandbox",

                "--disable-setuid-sandbox",

                "--disable-dev-shm-usage",

                "--disable-gpu",

                "--disable-extensions",

                "--disable-background-networking",

                "--disable-sync",

                "--disable-default-apps",

                "--disable-popup-blocking",

                "--disable-renderer-backgrounding",

                "--disable-background-timer-throttling",

                "--disable-ipc-flooding-protection",

                "--no-first-run",

                "--no-default-browser-check",

                "--disable-features=site-per-process",

                "--disable-features=Translate",

                "--disable-blink-features=AutomationControlled",

                "--no-zygote",

                "--single-process"

            ]

        }

    },

    /**
     * ======================================================
     * SESSION
     * ======================================================
     */

    session: {

        maxSessions: toInt(
            process.env.MAX_SESSIONS,
            20
        ),

        ttlMinutes: toInt(
            process.env.SESSION_TTL,
            30
        ),

        cleanupInterval: toInt(
            process.env.CLEANUP_INTERVAL,
            300000
        )

    },

    /**
     * ======================================================
     * SCREENSHOTS
     * ======================================================
     */

    screenshots: {

        enabled: toBool(
            process.env.SCREENSHOTS,
            true
        ),

        directory:
            process.env.SCREENSHOT_DIR ||
            "./screenshots",

        fullPage: true

    },

    /**
     * ======================================================
     * DOWNLOADS
     * ======================================================
     */

    downloads: {

        directory:
            process.env.DOWNLOAD_DIR ||
            "./downloads"

    },

    /**
     * ======================================================
     * UPLOADS
     * ======================================================
     */

    uploads: {

        directory:
            process.env.UPLOAD_DIR ||
            "./uploads"

    },

    /**
     * ======================================================
     * LOGGING
     * ======================================================
     */

    logging: {

        level:
            process.env.LOG_LEVEL || "info",

        requests: toBool(
            process.env.LOG_REQUESTS,
            true
        ),

        actions: toBool(
            process.env.LOG_ACTIONS,
            true
        )

    },

    /**
     * ======================================================
     * DEBUG
     * ======================================================
     */

    debug: {

        enabled: toBool(
            process.env.DEBUG,
            false
        ),

        screenshotsEveryStep:
            toBool(
                process.env.DEBUG_SCREENSHOTS,
                false
            )

    }

};

module.exports = config;