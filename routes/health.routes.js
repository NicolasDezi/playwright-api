const router = require("express").Router();
const { databaseHealth } = require("../db/health");

/**
 * HEALTH CHECK PRINCIPAL
 */
router.get("/", async (req, res) => {
  try {
    const db = await databaseHealth();

    res.json({
      ok: true,
      service: "playwright-api",
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: db?.ok ?? false,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      service: "playwright-api",
      status: "unhealthy",
      error: err.message,
    });
  }
});

module.exports = router;