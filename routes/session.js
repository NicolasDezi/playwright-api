const express = require("express");
const router = express.Router();

const {
    createSession,
    closeSession
} = require("../services/sessionManager");

// crear session
router.post("/create", async (req, res) => {
    const sessionId = await createSession();

    res.json({
        ok: true,
        sessionId
    });
});

// cerrar session
router.post("/close", async (req, res) => {
    const { sessionId } = req.body;

    await closeSession(sessionId);

    res.json({
        ok: true
    });
});

module.exports = router;