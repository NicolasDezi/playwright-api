require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const runRoute = require("./routes/run");
const healthRoute = require("./routes/health");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({ ok: true, service: "playwright-engine" });
});

app.use("/run", runRoute);
app.use("/health", healthRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Playwright Engine running on port ${PORT}`);
});