const path = require("path");
const fs = require("fs");

const config = require("../config/config");
const db = require("../db/connection");
const SessionService = require("./SessionService");

const screenshotDir = path.join(__dirname, "..", "storage", "screenshots");

/**
 * Asegurar directorio
 */
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

/**
 * ==========================================================
 * EXECUTE ACTIONS (PRO)
 * ==========================================================
 */
async function execute(actions, sessionId, options = {}) {

    const session = SessionService.get(sessionId);
    const page = session.page;

    const results = [];

    for (let i = 0; i < actions.length; i++) {

        const action = actions[i];
        const start = Date.now();

        const logId = await createLog({
            sessionId,
            action: action.type,
            step: i + 1,
            status: "running"
        });

        try {

            console.log(`[SESSION ${sessionId}] STEP ${i + 1}: ${action.type}`);

            switch (action.type) {

                case "goto":

                    await page.goto(action.url, {
                        waitUntil: action.waitUntil || "networkidle",
                        timeout: config.playwright.navigationTimeout
                    });

                    await page.waitForTimeout(2000);

                    break;

                case "click":

                    await page.click(action.selector, {
                        timeout: config.playwright.actionTimeout
                    });

                    break;

                case "fill":

                    await page.fill(action.selector, action.text || "");

                    break;

                case "press":

                    await page.keyboard.press(action.key);

                    break;

                case "wait":

                    await page.waitForTimeout(action.ms || 1000);

                    break;

                case "screenshot": {

                    const filename = `step_${sessionId}_${Date.now()}.png`;
                    const filePath = path.join(screenshotDir, filename);

                    await page.screenshot({
                        path: filePath,
                        fullPage: action.fullPage ?? true
                    });

                    await updateLog(logId, {
                        screenshot: filename
                    });

                    results.push({
                        step: i + 1,
                        type: action.type,
                        file: filename,
                        status: "ok"
                    });

                    continue;
                }

                default:
                    throw new Error(`Unknown action: ${action.type}`);
            }

            const duration = Date.now() - start;

            await updateLog(logId, {
                status: "ok",
                duration
            });

            results.push({
                step: i + 1,
                type: action.type,
                status: "ok",
                duration
            });

            /**
             * DEBUG SCREENSHOT (opcional)
             */
            if (options.debugScreenshots) {

                const filename = `debug_${sessionId}_${i + 1}.png`;
                const filePath = path.join(screenshotDir, filename);

                await page.screenshot({ path: filePath });

            }

        } catch (error) {

            const duration = Date.now() - start;

            await updateLog(logId, {
                status: "error",
                message: error.message,
                duration
            });

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

/**
 * ==========================================================
 * CREATE LOG
 * ==========================================================
 */
async function createLog({ sessionId, action, step, status }) {

    const result = await db.query(
        `INSERT INTO execution_logs
         (session_id, action, status, metadata)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
            sessionId,
            action,
            status,
            JSON.stringify({ step })
        ]
    );

    return result.rows[0].id;
}

/**
 * ==========================================================
 * UPDATE LOG
 * ==========================================================
 */
async function updateLog(id, data) {

    const fields = [];
    const values = [];
    let index = 1;

    for (const key in data) {
        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
    }

    values.push(id);

    const query = `
        UPDATE execution_logs
        SET ${fields.join(", ")}
        WHERE id = $${index}
    `;

    await db.query(query, values);
}

module.exports = {
    execute
};