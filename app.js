const express = require("express");

const app = express();

app.use(express.json());

/**
 * HEALTH CHECK SIMPLE
 */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "playwright-api",
    status: "running",
  });
});

/**
 * ROUTES
 * (IMPORTS CORREGIDOS)
 */
app.use("/health", require("./routes/health.routes"));
app.use("/run", require("./routes/run.routes"));

/**
 * SESSION ROUTES (CORREGIDO)
 * antes tenías session.routes.js (NO EXISTE)
 * ahora usamos session.js que SÍ está en tu repo
 */
app.use("/session", require("./routes/session"));

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Route not found",
  });
});

module.exports = app;