const express = require("express");
const { chromium } = require("playwright");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Playwright OK");
});

app.get("/test", async (req, res) => {

    const browser = await chromium.launch({
        headless: true
    });

    const page = await browser.newPage();

    await page.goto("https://www.google.com");

    const title = await page.title();

    await browser.close();

    res.json({
        ok: true,
        title
    });

});

app.listen(3000, () => {
    console.log("Servidor iniciado");
});