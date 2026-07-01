require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({

    host: process.env.DB_HOST,

    port: Number(process.env.DB_PORT),

    database: process.env.DB_NAME,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    max: 20,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 10000

});

/**
 * Test inicial
 */
pool.on("connect", () => {

    console.log("✅ PostgreSQL connected");

});

/**
 * Error global
 */
pool.on("error", (err) => {

    console.error("❌ PostgreSQL Pool Error");

    console.error(err);

});

/**
 * Query helper
 */
async function query(text, params = []) {

    const start = Date.now();

    const result = await pool.query(text, params);

    const duration = Date.now() - start;

    if (process.env.LOG_LEVEL === "debug") {

        console.log(

            `[DB] ${duration} ms`

        );

    }

    return result;

}

/**
 * Health Check
 */
async function healthCheck() {

    try {

        await pool.query("SELECT NOW()");

        return true;

    }
    catch {

        return false;

    }

}

/**
 * Graceful Shutdown
 */
async function shutdown() {

    console.log("Closing PostgreSQL pool...");

    await pool.end();

}

module.exports = {

    pool,

    query,

    healthCheck,

    shutdown

};