const path = require("path");
const fs = require("fs");

const {
    getSession
} = require("../sessionManager");

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

        try {
            let result = {
                step: i + 1,
                type: action.type
            };

            console.log(`[SESSION ${sessionId}] STEP ${i + 1}: ${action.type}`);

            switch (action.type) {

                case "goto":
                    await page.goto(action.url, {
                        waitUntil: "domcontentloaded",
                        timeout: options.timeout || 30000
                    });
                    break;

                case "fill":
                    await page.fill(action.selector, action.text);
                    break;

                case "click":
                    await page.click(action.selector);
                    break;

                case "press":
                    await page.keyboard.press(action.key);
                    break;

                case "wait":
                    await page.waitForTimeout(action.ms || 1000);
                    break;

                case "screenshot":
                    break;

                default:
                    throw new Error(`Unknown action: ${action.type}`);
            }

            if (options.screenshot) {
                const file = `step_${sessionId}_${i + 1}.png`;
                const filePath = path.join(screenshotDir, file);

                await page.screenshot({ path: filePath });

                result.screenshot = file;
            }

            result.status = "ok";
            results.push(result);

        } catch (error) {
            results.push({
                step: i + 1,
                type: action.type,
                status: "error",
                error: error.message
            });

            console.error(`[ERROR] session=${sessionId}`, error.message);

            if (options.stopOnError !== false) {
                break;
            }
        }
    }

    return {
        ok: true,
        sessionId,
        results
    };
}

async function takeScreenshot(sessionId) {
    const session = global.sessions?.get(sessionId);

    if (!session) throw new Error("Session not found");

    const buffer = await session.page.screenshot({
        fullPage: true
    });

    return buffer.toString("base64");
}

module.exports = {
    executeActions,
    takeScreenshot
};

module.exports = {
    executeActions
};