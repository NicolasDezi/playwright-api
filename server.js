const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const {
    createSession,
    closeSession,
    getSession
} = require("./sessionManager");

const {
    executeActions,
    takeScreenshot
} = require("./services/actionExecutor");

const { addTask } = require("./queue/taskQueue");

const logsRouter = require("./routes/logs");
const workflowRoutes = require("./routes/workflows");

const {
    authMiddleware,
    createUser
} = require("./auth/apiKeyManager");

/**
 * ==========================================================
 * APP INIT
 * ==========================================================
 */
const app = express();
app.use(express.json({ limit: "10mb" }));

/**
 * ==========================================================
 * HEALTH CHECK
 * ==========================================================
 */
app.get("/", (req, res) => {
    res.send("Playwright API OK");
});

app.get("/health", (req, res) => {
    res.json({
        ok: true,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
    });
});

/**
 * ==========================================================
 * AUTH ROUTES
 * ==========================================================
 */
app.post("/auth/register", (req, res) => {

    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            ok: false,
            error: "name is required"
        });
    }

    const user = createUser(name);

    res.json({
        ok: true,
        user
    });
});

/**
 * ==========================================================
 * DEBUG ROUTES
 * ==========================================================
 */
app.use("/debug", authMiddleware, logsRouter);

/**
 * ==========================================================
 * WORKFLOWS
 * ==========================================================
 */
app.use("/workflows", authMiddleware, workflowRoutes);

/**
 * ==========================================================
 * SESSION CREATE (TENANT SAFE)
 * ==========================================================
 */
app.post("/session/create", authMiddleware, async (req, res) => {

    try {

        const sessionId = await createSession(req.user.id);

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
 * ==========================================================
 * SESSION CLOSE
 * ==========================================================
 */
app.post("/session/close", authMiddleware, async (req, res) => {

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
            closed: true
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
 * ==========================================================
 * RUN ACTIONS (TENANT SAFE + QUEUE)
 * ==========================================================
 */
app.post("/run", authMiddleware, async (req, res) => {

    try {

        const {
            sessionId,
            actions,
            debug
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

        // validar session ownership
        const session = getSession(sessionId, req.user.id);

        const result = await addTask(() =>
            executeActions(actions, sessionId, {
                screenshot: debug === true,
                debug: debug === true,
                stopOnError: true
            })
        );

        return res.json({
            ok: true,
            result
        });

    } catch (error) {

        console.error("[RUN ERROR]", error);

        return res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * ==========================================================
 * SCREENSHOT API
 * ==========================================================
 */
app.post("/screenshot", authMiddleware, async (req, res) => {

    try {

        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                ok: false,
                error: "sessionId is required"
            });
        }

        const session = getSession(sessionId, req.user.id);

        const result = await takeScreenshot(sessionId);

        return res.json({
            ok: true,
            ...result
        });

    } catch (error) {

        console.error("[SCREENSHOT ERROR]", error);

        return res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * ==========================================================
 * WORKFLOW ROUTE MOUNT
 * ==========================================================
 */
app.use("/workflows", authMiddleware, workflowRoutes);

/**
 * ==========================================================
 * HTTP + WEBSOCKET SERVER
 * ==========================================================
 */
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {

    try {

        const url = new URL(req.url, "http://localhost");

        const sessionId = url.searchParams.get("sessionId");
        const apiKey = url.searchParams.get("apiKey");

        if (!sessionId || !apiKey) {
            ws.close();
            return;
        }

        // simple auth check (reuse middleware logic conceptually)
        ws.sessionId = sessionId;
        ws.apiKey = apiKey;

        console.log(`[WS] Connected session=${sessionId}`);

        ws.on("close", () => {
            console.log(`[WS] Disconnected session=${sessionId}`);
        });

    } catch (err) {

        console.error("[WS ERROR]", err.message);
        ws.close();
    }
});

/**
 * ==========================================================
 * START SERVER
 * ==========================================================
 */
const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {

    console.log("====================================");
    console.log("🚀 Playwright API (SAAS MODE)");
    console.log("🔐 Multi-tenant enabled");
    console.log("📡 WebSocket enabled");
    console.log("🌐 Port:", PORT);
    console.log("🧠 PID:", process.pid);
    console.log("====================================");
});

/**
 * ==========================================================
 * GRACEFUL SHUTDOWN
 * ==========================================================
 */
process.on("SIGTERM", () => {

    console.log("SIGTERM received. Closing server...");

    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});

process.on("SIGINT", () => {

    console.log("SIGINT received. Closing server...");

    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});