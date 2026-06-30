const express = require("express");
const router = express.Router();

const { executeActions } = require("../services/actionExecutor");

router.post("/", async (req, res) => {
    try {
        const { actions } = req.body;

        if (!actions || !Array.isArray(actions)) {
            return res.status(400).json({
                ok: false,
                error: "actions must be an array"
            });
        }

        const result = await executeActions(actions);

        res.json({
            ok: true,
            ...result
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            ok: false,
            error: err.message
        });
    }
});

module.exports = router;