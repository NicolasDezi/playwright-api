const express = require("express");

const {
  createSession,
  goto,
  click,
  type,
  takeScreenshot,
  closeSession,
} = require("./services/browserService");

const app = express();

app.use(express.json());

/**
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "playwright-api",
    status: "running",
  });
});

/**
 * CREATE SESSION
 */
app.post("/session/create", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    await createSession(sessionId);

    res.json({
      ok: true,
      sessionId,
    });
  } catch (err) {
    console.error("[SESSION CREATE ERROR]", err);
    res.status(500).json({
      error: err.message,
    });
  }
});

/**
 * RUN ACTIONS
 */
app.post("/run", async (req, res) => {
  const { sessionId, actions } = req.body;

  if (!sessionId || !actions) {
    return res.status(400).json({
      error: "sessionId and actions are required",
    });
  }

  try {
    for (const action of actions) {
      switch (action.type) {
        case "goto":
          await goto(sessionId, action.url);
          break;

        case "click":
          await click(sessionId, action.selector);
          break;

        case "type":
          await type(sessionId, action.selector, action.text);
          break;

        default:
          console.warn(`[UNKNOWN ACTION] ${action.type}`);
      }
    }

    res.json({
      ok: true,
      executed: actions.length,
    });
  } catch (err) {
    console.error("[RUN ERROR]", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/**
 * SCREENSHOT (FIX DEFINITIVO)
 */
app.post("/screenshot", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      error: "sessionId is required",
    });
  }

  try {
    const imageBuffer = await takeScreenshot(sessionId);

    res.setHeader("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (err) {
    console.error("[SCREENSHOT ERROR]", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/**
 * CLOSE SESSION
 */
app.post("/session/close", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      error: "sessionId is required",
    });
  }

  try {
    await closeSession(sessionId);

    res.json({
      ok: true,
      closed: sessionId,
    });
  } catch (err) {
    console.error("[SESSION CLOSE ERROR]", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/**
 * START SERVER
 */
app.listen(8080, () => {
  console.log("====================================");
  console.log("🚀 Playwright API (FASE 3 FIXED)");
  console.log("🌐 Port: 8080");
  console.log("====================================");
});