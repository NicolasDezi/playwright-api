const express = require("express");
const config = require("../config/config");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * ROUTES
 */
const healthRoutes = require("../routes/health.routes");
const sessionRoutes = require("../routes/session.routes");
const runRoutes = require("../routes/run.routes");

app.use("/health", healthRoutes);
app.use("/session", sessionRoutes);
app.use("/run", runRoutes);

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        error: "Route not found"
    });
});

module.exports = app;