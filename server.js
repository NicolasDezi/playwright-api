const express = require("express");
const { chromium } = require("playwright");

const app = express();

app.use(express.json());

/**
 * Health check
 */
app.get("/", (req, res) => {
    res.send("Playwright OK");
});

/**
 * Playwright test endpoint
 */
app.get("/test", async (req, res) => {
    let browser = null;

    try {
        browser = await chromium.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        });

        const page = await browser.newPage();

        await page.goto("https://www.google.com", {
            waitUntil: "domcontentloaded"
        });

        const title = await page.title();

        await browser.close();
        browser = null;

        res.json({
            ok: true,
            title
        });

    } catch (error) {
        if (browser) {
            await browser.close();
        }

        console.error("Playwright error:", error);

        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * Start server
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});