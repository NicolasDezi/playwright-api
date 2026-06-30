const express = require("express");
const router = express.Router();

const { executeActions } = require("../services/actionExecutor");

router.post("/", async (req, res) => {
    try {

        const { actions, sessionId } = req.body;

        const result = await executeActions(actions, sessionId);

        res.json({
            ok: true,
            ...result
        });

    } catch (err) {
        res.status(500).json({
            ok: false,
            error: err.message
        });
    }
});

module.exports = router;