const path = require("path");
const fs = require("fs");

const {
    getSession
} = require("../sessionManager");

/**
 * ===========================================================
 * EXECUTE ACTIONS
 * ===========================================================
 */
async function executeActions(actions, sessionId, options = {}) {

    const session = getSession(sessionId);

    if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
    }

    const page = session.page;

    const results = [];

    const screenshotDir = path.join(__dirname, "..", "screenshots");

    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

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

            switch (action.type) {

                /**
                 * ----------------------------------------
                 * GOTO
                 * ----------------------------------------
                 */
                case "goto":

                    await page.goto(action.url, {
                        waitUntil: action.waitUntil || "domcontentloaded",
                        timeout: action.timeout || options.timeout || 30000
                    });

                    break;

                /**
                 * ----------------------------------------
                 * CLICK
                 * ----------------------------------------
                 */
                case "click":

                    await page.click(action.selector);

                    break;

                /**
                 * ----------------------------------------
                 * FILL
                 * ----------------------------------------
                 */
                case "fill":

                    await page.fill(
                        action.selector,
                        action.text || ""
                    );

                    break;

                /**
                 * ----------------------------------------
                 * PRESS KEY
                 * ----------------------------------------
                 */
                case "press":

                    await page.keyboard.press(action.key);

                    break;

                /**
                 * ----------------------------------------
                 * WAIT
                 * ----------------------------------------
                 */
                case "wait":

                    await page.waitForTimeout(
                        action.ms || 1000
                    );

                    break;

                /**
                 * ----------------------------------------
                 * SCREENSHOT ACTION
                 * ----------------------------------------
                 */
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

                /**
                 * ----------------------------------------
                 * UNKNOWN
                 * ----------------------------------------
                 */
                default:

                    throw new Error(
                        `Unknown action: ${action.type}`
                    );
            }

            /**
             * Screenshot after every step (debug mode)
             */
            if (options.screenshot === true) {

                const filename =
                    `debug_${sessionId}_${i + 1}.png`;

                const filePath = path.join(
                    screenshotDir,
                    filename
                );

                await page.screenshot({
                    path: filePath,
                    fullPage: true
                });

                result.debugScreenshot = filename;
            }

            result.status = "ok";

        }
        catch (error) {

            result.status = "error";
            result.error = error.message;

            console.error(error);

            if (options.stopOnError !== false) {

                results.push(result);

                return {
                    ok: false,
                    sessionId,
                    results
                };
            }

        }

        results.push(result);

    }

    return {

        ok: true,
        sessionId,
        results

    };

}

/**
 * ===========================================================
 * TAKE SCREENSHOT API
 * ===========================================================
 */
async function takeScreenshot(sessionId) {

    const session = getSession(sessionId);

    if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
    }

    const page = session.page;

    const buffer = await page.screenshot({

        fullPage: true,
        type: "png"

    });

    return buffer.toString("base64");

}

module.exports = {

    executeActions,
    takeScreenshot

};