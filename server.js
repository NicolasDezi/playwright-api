const express = require("express");

const {
    createSession,
    closeSession,
    getSession // opcional si lo tenés o lo agregás
} = require("./sessionManager");

const {
    executeActions,
    takeScreenshot // 👈 NUEVO (lo agregamos abajo)
} = require("./services/actionExecutor");

const app = express();

app.use(express.json({ limit: "10mb" }));

/**
 * -------------------------------------------------
 * LOG MIDDLEWARE (DEBUG PRO)
 * -------------------------------------------------
 */
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

/**
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
    res.send("Playwright API OK");
});

app.get("/health", (req, res) => {
    res.json({
        ok: true,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

/**
 * -------------------------------------------------
 * 1. CREATE SESSION
 * -------------------------------------------------
 */
app.post("/session/create", async (req, res) => {
    try {
        const sessionId = await createSession();

        res.json({
            ok: true,
            sessionId
        });

    } catch (err) {
        console.error("[SESSION CREATE ERROR]", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

/**
 * -------------------------------------------------
 * 2. RUN ACTIONS
 * -------------------------------------------------
 */
app.post("/run", async (req, res) => {
    try {
        const { sessionId, actions } = req.body;

        if (!sessionId) {
            return res.status(400).json({ ok: false, error: "sessionId required" });
        }

        const result = await executeActions(actions, sessionId);

        res.json({
            ok: true,
            result
        });

    } catch (err) {
        console.error("[RUN ERROR]", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

/**
 * -------------------------------------------------
 * 3. SCREENSHOT (FASE 3 🔥)
 * -------------------------------------------------
 * POST /screenshot
 * body: { sessionId }
 */
app.post("/screenshot", async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                ok: false,
                error: "sessionId required"
            });
        }

        const screenshot = await takeScreenshot(sessionId);

        res.json({
            ok: true,
            sessionId,
            screenshot // base64
        });

    } catch (err) {
        console.error("[SCREENSHOT ERROR]", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

/**
 * -------------------------------------------------
 * 4. SESSION CLOSE
 * -------------------------------------------------
 */
app.post("/session/close", async (req, res) => {
    try {
        const { sessionId } = req.body;

        await closeSession(sessionId);

        res.json({
            ok: true,
            closed: true
        });

    } catch (err) {
        console.error("[SESSION CLOSE ERROR]", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

/**
 * -------------------------------------------------
 * 5. SESSION DEBUG (PRO INSPECTION)
 * -------------------------------------------------
 */
app.get("/session/:id", (req, res) => {
    const { id } = req.params;

    res.json({
        ok: true,
        sessionId: id,
        status: "active",
        message: "Debug endpoint (extend sessionManager if needed)"
    });
});

/**
 * -------------------------------------------------
 * START SERVER
 * -------------------------------------------------
 */
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("====================================");
    console.log("🚀 Playwright API (FASE 3)");
    console.log("🌐 Port:", PORT);
    console.log("====================================");
});

/**
 * -------------------------------------------------
 * GRACEFUL SHUTDOWN (FIXED)
 * -------------------------------------------------
 */
process.on("SIGTERM", async () => {
    console.log("SIGTERM received... closing server");

    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});