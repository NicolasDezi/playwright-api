const { getPage, closeBrowser } = require("./browserService");

async function executeActions(actions) {
    const page = await getPage();

    const results = [];
    const start = Date.now();

    for (let i = 0; i < actions.length; i++) {
        const action = actions[i];

        try {
            let result = null;

            switch (action.type) {

                case "goto":
                    await page.goto(action.url);
                    result = { ok: true };
                    break;

                case "wait":
                    await page.waitForTimeout(action.milliseconds || 1000);
                    result = { ok: true };
                    break;

                case "fill":
                    await page.fill(action.selector, action.text);
                    result = { ok: true };
                    break;

                case "click":
                    await page.click(action.selector);
                    result = { ok: true };
                    break;

                case "press":
                    await page.keyboard.press(action.key);
                    result = { ok: true };
                    break;

                case "title":
                    result = await page.title();
                    break;

                case "html":
                    result = await page.content();
                    break;

                case "text":
                    result = await page.textContent(action.selector);
                    break;

                case "screenshot":
                    const path = `screenshots/screen_${Date.now()}.png`;
                    await page.screenshot({ path, fullPage: true });
                    result = { path };
                    break;

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

    await closeBrowser();

    return {
        executionTime: Date.now() - start,
        results
    };
}

module.exports = {
    executeActions
};