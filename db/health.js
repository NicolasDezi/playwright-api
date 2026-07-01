const db = require("./connection");

/**
 * ==========================================================
 * DATABASE HEALTH CHECK
 * ==========================================================
 */
async function databaseHealth() {

    const started = Date.now();

    try {

        const version = await db.query(`
            SELECT version();
        `);

        const uptime = await db.query(`
            SELECT NOW();
        `);

        const connections = await db.query(`
            SELECT
                count(*) AS total
            FROM
                pg_stat_activity;
        `);

        const latency = Date.now() - started;

        return {

            ok: true,

            latency,

            timestamp: uptime.rows[0].now,

            version: version.rows[0].version,

            connections: Number(
                connections.rows[0].total
            )

        };

    }
    catch (err) {

        return {

            ok: false,

            error: err.message

        };

    }

}

module.exports = {

    databaseHealth

};