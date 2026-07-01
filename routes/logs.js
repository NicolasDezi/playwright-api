const express = require("express");
const router = express.Router();

const {
    getLogs
} = require("../services/sessionLogger");

router.get("/session/:id/logs", (req, res) => {

    const logs = getLogs(req.params.id);

    res.json({
        ok: true,
        sessionId: req.params.id,
        logs
    });
});

module.exports = router;