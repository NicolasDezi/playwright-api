require("dotenv").config();

const app = require("./app/app");
const config = require("./config/config");
const { healthCheck } = require("./db/health");
const db = require("./db/connection");

const PORT = config.server.port;

/**
 * START SERVER
 */
async function start() {

    console.log("🚀 Starting Playwright API...");

    /**
     * DB CHECK
     */
    const ok = await healthCheck();

    if (!ok.ok) {
        console.error("❌ Database connection failed");
        process.exit(1);
    }

    console.log("✅ Database connected");

    const server = app.listen(PORT, config.server.host, () => {
        console.log(`✅ Server running on http://${config.server.host}:${PORT}`);
    });

    /**
     * Graceful shutdown
     */
    process.on("SIGINT", async () => {
        console.log("Shutting down...");

        server.close();

        await db.shutdown();

        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        console.log("Shutting down...");

        server.close();

        await db.shutdown();

        process.exit(0);
    });
}

start();