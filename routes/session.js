const express = require("express");

const router = express.Router();

const {
    createSession,
    closeSession,
    getSession,
    listSessions
} = require("../services/sessionManager");

router.post("/create", async (req, res) => {

    try {

        const session = await createSession();

        res.json({
            ok: true,
            sessionId: session.id
        });

    } catch (err) {

        res.status(500).json({
            ok: false,
            error: err.message
        });

    }

});

router.post("/close", async (req, res) => {

    try {

        const { sessionId } = req.body;

        const ok = await closeSession(sessionId);

        if (!ok) {

            return res.status(404).json({
                ok: false,
                error: "Session not found"
            });

        }

        res.json({
            ok: true
        });

    } catch (err) {

        res.status(500).json({
            ok: false,
            error: err.message
        });

    }

});

router.get("/list", (req, res) => {

    res.json({
        ok: true,
        sessions: listSessions()
    });

});

router.get("/:id", (req, res) => {

    const session = getSession(req.params.id);

    if (!session) {

        return res.status(404).json({
            ok: false,
            error: "Session not found"
        });

    }

    res.json({
        ok: true,
        session: {
            id: session.id,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity
        }
    });

});

module.exports = router;