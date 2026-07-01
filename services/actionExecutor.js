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
                `[SESSION ${sessionId}] STEP ${i + 1}: ${action.type}`
            );

            switch (action.type) {

                /**
                 * ----------------------------------------
                 * GOTO
                 * ----------------------------------------
                 */
                case "goto":

                    await page.goto(action.url, {

                        waitUntil: "networkidle",
                        timeout: action.timeout || options.timeout || 60000

                    });

                    await page.waitForTimeout(3000);

                    console.log("URL:", page.url());

                    console.log(
                        "TITLE:",
                        await page.title()
                    );

                    try {

                        const body =
                            await page.locator("body").innerText();

                        console.log(
                            "BODY:",
                            body.substring(0, 200)
                        );

                    } catch (e) {

                        console.log("BODY: unable to read");

                    }

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
                 * PRESS
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
                 * SCREENSHOT
                 * ----------------------------------------
                 */
                case "screenshot": {

                    console.log("Taking screenshot...");
                    console.log("URL:", page.url());

                    console.log(
                        "TITLE:",
                        await page.title()
                    );

                    try {

                        const body =
                            await page.locator("body").innerText();

                        console.log(
                            "BODY:",
                            body.substring(0, 200)
                        );

                    } catch (e) {

                        console.log("BODY: unable to read");

                    }

                    const filename =
                        action.filename ||
                        `step_${sessionId}_${Date.now()}.png`;

                    const filePath =
                        path.join(
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

                    throw new Error(
                        `Unknown action: ${action.type}`
                    );

            }

            /**
             * Debug Screenshot
             */
            if (options.screenshot === true) {

                const filename =
                    `debug_${sessionId}_${i + 1}.png`;

                const filePath =
                    path.join(
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

            console.error(error);

            result.status = "error";
            result.error = error.message;

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
 * TAKE SCREENSHOT
 * ===========================================================
 */
async function takeScreenshot(sessionId) {

    const session = getSession(sessionId);

    const page = session.page;

    console.log("Taking API Screenshot...");
    console.log("URL:", page.url());

    console.log(
        "TITLE:",
        await page.title()
    );

    try {

        const body =
            await page.locator("body").innerText();

        console.log(
            "BODY:",
            body.substring(0, 200)
        );

    } catch (e) {

        console.log("BODY: unable to read");

    }

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