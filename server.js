const express = require("express");

const {
    createSession,
    closeSession
} = require("./sessionManager");

const {
    executeActions
} = require("./services/actionExecutor");

const app = express();

/**
 * -------------------------------------------------
 * MIDDLEWARE
 * -------------------------------------------------
 */
app.use(express.json({ limit: "10mb" }));

/**
 * -------------------------------------------------
 * HEALTHCHECK
 * -------------------------------------------------
 */
app.get("/", (req, res) => {
    res.send("Playwright API OK");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        ok: true,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

/**
 * -------------------------------------------------
 * 1. CREATE SESSION
 * -------------------------------------------------
 * POST /session/create
 */
app.post("/session/create", async (req, res) => {
    try {
        const sessionId = await createSession();

        return res.json({
            ok: true,
            sessionId
        });

    } catch (error) {
        console.error("[SESSION CREATE ERROR]", error);

        return res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * -------------------------------------------------
 * 2. EXECUTE ACTIONS ENGINE
 * -------------------------------------------------
 * POST /run
 *
 * body:
 * {
 *   sessionId,
 *   actions: [],
 *   options: {
 *      screenshot: true,
 *      stopOnError: true,
 *      timeout: 30000
 *   }
 * }
 */
app.post("/run", async (req, res) => {
    try {
        const {
            sessionId,
            actions,
            options = {}
        } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                ok: false,
                error: "sessionId is required"
            });
        }

        if (!Array.isArray(actions)) {
            return res.status(400).json({
                ok: false,
                error: "actions must be an array"
            });
        }

        console.log(`[RUN START] session=${sessionId} actions=${actions.length}`);

        const result = await executeActions(actions, sessionId, options);

        console.log(`[RUN END] session=${sessionId}`);

        return res.json(result);

    } catch (error) {
        console.error("[RUN ERROR]", error);

        return res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * -------------------------------------------------
 * 3. CLOSE SESSION
 * -------------------------------------------------
 * POST /session/close
 */
app.post("/session/close", async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                ok: false,
                error: "sessionId is required"
            });
        }

        await closeSession(sessionId);

        return res.json({
            ok: true,
            closed: true,
            sessionId
        });

    } catch (error) {
        console.error("[SESSION CLOSE ERROR]", error);

        return res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * -------------------------------------------------
 * SERVER START
 * -------------------------------------------------
 */
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("====================================");
    console.log("🚀 Playwright API running (PRO MODE)");
    console.log("🌐 Port:", PORT);
    console.log("====================================");
});

/**
 * -------------------------------------------------
 * GRACEFUL SHUTDOWN (EASYPANEL SAFE)
 * -------------------------------------------------
 */
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down...");

    server.close(() => {
        console.log("Server closed cleanly.");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down...");

    server.close(() => {
        console.log("Server closed cleanly.");
        process.exit(0);
    });
});