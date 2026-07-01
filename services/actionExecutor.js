const path = require("path");
const fs = require("fs");

const { getSession } = require("../sessionManager");
const { log } = require("./sessionLogger");

/**
 * ==========================================================
 * EXECUTE ACTIONS (PRODUCTION CORE)
 * ==========================================================
 */
async function executeActions(actions, sessionId, options = {}) {

    const session = await getSession(sessionId);

    const page = session.page;

    const results = [];

    const screenshotDir = path.join(__dirname, "..", "screenshots");

    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    log(sessionId, {
        type: "session_start",
        actions: actions.length
    });

    for (let i = 0; i < actions.length; i++) {

        const action = actions[i];

        const result = {
            step: i + 1,
            type: action.type
        };

        try {

            console.log(
                `[SESSION ${sessionId}] STEP ${i + 1} -> ${action.type}`
            );

            log(sessionId, {
                type: "action_start",
                step: i + 1,
                action: action.type
            });

            /**
             * =========================
             * ACTION ROUTER
             * =========================
             */
            switch (action.type) {

                case "goto":

                    await page.goto(action.url, {
                        waitUntil: action.waitUntil || "networkidle",
                        timeout: action.timeout || 60000
                    });

                    await page.waitForTimeout(2000);

                    break;

                case "click":

                    await page.click(action.selector, {
                        timeout: 30000
                    });

                    break;

                case "fill":

                    await page.fill(
                        action.selector,
                        action.text || ""
                    );

                    break;

                case "press":

                    await page.keyboard.press(action.key);

                    break;

                case "wait":

                    await page.waitForTimeout(action.ms || 1000);

                    break;

                case "evaluate":

                    result.value = await page.evaluate(action.script);
                    break;

                case "screenshot": {

                    const filename =
                        action.filename ||
                        `step_${sessionId}_${Date.now()}.png`;

                    const filePath = path.join(
                        screenshotDir,
                        filename
                    );

                    await page.screenshot({
                        path: filePath,
                        fullPage: action.fullPage ?? true
                    });

                    result.file = filename;

                    break;
                }

                default:
                    throw new Error(`Unknown action: ${action.type}`);
            }

            /**
             * DEBUG LOGS (OPTIONAL)
             */
            if (options.debug === true) {

                const url = page.url();
                const title = await page.title();

                console.log("URL:", url);
                console.log("TITLE:", title);
            }

            /**
             * AUTO DEBUG SCREENSHOT
             */
            if (options.screenshot === true) {

                const filename = `debug_${sessionId}_${i + 1}.png`;

                const filePath = path.join(screenshotDir, filename);

                await page.screenshot({
                    path: filePath,
                    fullPage: true
                });

                result.debugScreenshot = filename;
            }

            result.status = "ok";

            log(sessionId, {
                type: "action_success",
                step: i + 1,
                action: action.type
            });

        } catch (error) {

            console.error(`[ERROR] session=${sessionId}`, error.message);

            result.status = "error";
            result.error = error.message;

            log(sessionId, {
                type: "action_error",
                step: i + 1,
                action: action.type,
                message: error.message
            });

            if (options.stopOnError !== false) {
                results.push(result);

                log(sessionId, {
                    type: "session_stopped",
                    reason: "error"
                });

                return {
                    ok: false,
                    sessionId,
                    results
                };
            }
        }

        results.push(result);
    }

    log(sessionId, {
        type: "session_end"
    });

    return {
        ok: true,
        sessionId,
        results
    };
}

/**
 * ==========================================================
 * SCREENSHOT API
 * ==========================================================
 */
async function takeScreenshot(sessionId) {

    const session = await getSession(sessionId);

    const page = session.page;

    const buffer = await page.screenshot({
        fullPage: true,
        type: "png"
    });

    return {
        sessionId,
        screenshot: buffer.toString("base64")
    };
}

module.exports = {
    executeActions,
    takeScreenshot
};