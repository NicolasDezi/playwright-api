const express = require("express");

const {
    createSession,
    closeSession
} = require("./sessionManager");

const {
    executeActions
} = require("./actionExecutor");

const app = express();

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

        res.json({
            ok: true,
            sessionId
        });

    } catch (error) {
        console.error("Error creating session:", error);

        res.status(500).json({
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
 *
 * body:
 * {
 *   sessionId: "abc123",
 *   actions: [...]
 * }
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

        if (!actions || !Array.isArray(actions)) {
            return res.status(400).json({
                ok: false,
                error: "actions must be an array"
            });
        }

        const result = await executeActions(actions, sessionId);

        res.json(result);

    } catch (error) {
        console.error("Error executing actions:", error);

        res.status(500).json({
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

        res.json({
            ok: true,
            closed: true,
            sessionId
        });

    } catch (error) {
        console.error("Error closing session:", error);

        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * -------------------------------------------------
 * START SERVER
 * -------------------------------------------------
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Playwright API running on port ${PORT}`);
});