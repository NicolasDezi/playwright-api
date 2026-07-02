const express = require("express");
const cors = require("cors");
const config = require("./config");

const sessionRoutes = require("./routes/session");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/session", sessionRoutes);

// Health check (IMPORTANTE para EasyPanel / Swarm)
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "playwright-api"
    });
});

module.exports = app;