require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

/**
 * START SERVER
 */
const server = app.listen(PORT, HOST, () => {
  console.log("====================================");
  console.log("🚀 Playwright API");
  console.log(`🌐 Server running at http://${HOST}:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("====================================");
});

/**
 * Graceful shutdown
 */
const shutdown = (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down...`);

  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });

  // por si queda colgado
  setTimeout(() => {
    console.log("⚠️ Force shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

/**
 * Error handling global
 */
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:");
  console.error(err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:");
  console.error(reason);
});