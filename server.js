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
 * Middleware
 */
app.use(express.json({ limit: "10mb" }));

/**
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
    res.send("Playwright API OK");
});

/**
 * -------------------------------------------------
 * 1. CREAR SESIÓN
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
 * 2. EJECUTAR ACCIONES
 * -------------------------------------------------
 * POST /run
 */
app.post("/run", async (req, res) => {
    try {
        const { sessionId, actions } = req.body;

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

        const result = await executeActions(actions, sessionId);

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
 * 3. CERRAR SESIÓN
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
 * START SERVER (EASYPANEL READY)
 * -------------------------------------------------
 */
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
    console.log("====================================");
    console.log("🚀 Playwright API running");
    console.log("🌐 Port:", PORT);
    console.log("====================================");
});

/**
 * Graceful shutdown (PRO)
 */
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Closing server...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});