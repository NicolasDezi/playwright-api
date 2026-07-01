require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log("====================================");
  console.log("🚀 Playwright API");
  console.log(`🌐 Server running at http://${HOST}:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("====================================");
});

/**
 * Crash logging REAL
 */
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:");
  console.error(err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:");
  console.error(reason);
});