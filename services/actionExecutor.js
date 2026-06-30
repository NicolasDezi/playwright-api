const { getPage, closeSession } = require("./sessionManager");

/**
 * Ejecuta una lista de acciones sobre una sesión Playwright
 */
async function executeActions(actions, sessionId = null) {

    const page = getPage(sessionId);

    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < actions.length; i++) {

        const action = actions[i];

        try {
            let result = null;

            switch (action.type) {

                // --------------------
                // NAVEGACIÓN
                // --------------------
                case "goto":
                    await page.goto(action.url, {
                        waitUntil: "domcontentloaded"
                    });
                    result = { url: action.url };
                    break;

                case "wait":
                    await page.waitForTimeout(action.milliseconds || 1000);
                    result = { waited: action.milliseconds || 1000 };
                    break;

                case "reload":
                    await page.reload();
                    result = { reloaded: true };
                    break;

                case "back":
                    await page.goBack();
                    result = { back: true };
                    break;

                case "forward":
                    await page.goForward();
                    result = { forward: true };
                    break;

                // --------------------
                // INTERACCIÓN
                // --------------------
                case "click":
                    await page.click(action.selector, { timeout: 30000 });
                    result = { clicked: action.selector };
                    break;

                case "dblclick":
                    await page.dblclick(action.selector);
                    result = { dblclicked: action.selector };
                    break;

                case "fill":
                    await page.fill(action.selector, action.text || "");
                    result = { filled: action.selector };
                    break;

                case "type":
                    await page.type(action.selector, action.text || "", {
                        delay: action.delay || 50
                    });
                    result = { typed: action.selector };
                    break;

                case "press":
                    await page.keyboard.press(action.key);
                    result = { key: action.key };
                    break;

                case "hover":
                    await page.hover(action.selector);
                    result = { hover: action.selector };
                    break;

                // --------------------
                // EXTRACCIÓN
                // --------------------
                case "title":
                    result = await page.title();
                    break;

                case "html":
                    result = await page.content();
                    break;

                case "text":
                    result = await page.textContent(action.selector);
                    break;

                case "attribute":
                    result = await page.getAttribute(action.selector, action.name);
                    break;

                case "url":
                    result = page.url();
                    break;

                // --------------------
                // SCREENSHOT
                // --------------------
                case "screenshot":
                    const path = `screenshots/screen_${Date.now()}_${i}.png`;

                    await page.screenshot({
                        path,
                        fullPage: action.fullPage !== false
                    });

                    result = { path };
                    break;

                // --------------------
                // EVALUATE JS
                // --------------------
                case "evaluate":
                    result = await page.evaluate(action.code);
                    break;

                // --------------------
                // DEFAULT
                // --------------------
                default:
                    throw new Error(`Unknown action type: ${action.type}`);
            }

            results.push({
                step: i + 1,
                type: action.type,
                status: "ok",
                result
            });

        } catch (err) {

            results.push({
                step: i + 1,
                type: action.type,
                status: "error",
                error: err.message
            });
        }
    }

    return {
        success: true,
        executionTime: Date.now() - startTime,
        steps: results
    };
}

module.exports = {
    executeActions
};