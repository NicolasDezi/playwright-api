const db = require("../db/connection");

/**
 * ==========================================================
 * LOG EXECUTION
 * ==========================================================
 */
async function logExecution({
    userId = null,
    sessionId = null,
    workflowId = null,
    status = "SUCCESS",
    action = null,
    message = null,
    metadata = {}
}) {

    try {

        await db.query(
            `
            INSERT INTO execution_logs
            (
                user_id,
                session_id,
                workflow_id,
                status,
                action,
                message,
                metadata,
                created_at
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,NOW()
            )
            `,
            [
                userId,
                sessionId,
                workflowId,
                status,
                action,
                message,
                JSON.stringify(metadata)
            ]
        );

    }
    catch (err) {

        console.error("[LOGGER]", err.message);

    }

}

module.exports = {
    logExecution
};