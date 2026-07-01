const express = require("express");
const router = express.Router();

const {
    createWorkflow,
    addStep,
    getWorkflow,
    listWorkflows
} = require("../services/workflowRecorder");

const {
    runWorkflow
} = require("../services/workflowRunner");

/**
 * CREATE WORKFLOW
 */
router.post("/create", (req, res) => {

    const { sessionId } = req.body;

    const workflowId = createWorkflow(sessionId);

    res.json({
        ok: true,
        workflowId
    });
});

/**
 * ADD STEP
 */
router.post("/:id/step", (req, res) => {

    try {

        const { id } = req.params;

        addStep(id, req.body);

        res.json({ ok: true });

    } catch (err) {

        res.status(500).json({
            ok: false,
            error: err.message
        });
    }
});

/**
 * GET WORKFLOW
 */
router.get("/:id", (req, res) => {

    const wf = getWorkflow(req.params.id);

    res.json({
        ok: true,
        workflow: wf
    });
});

/**
 * LIST WORKFLOWS
 */
router.get("/", (req, res) => {

    res.json({
        ok: true,
        workflows: listWorkflows()
    });
});

/**
 * RUN WORKFLOW
 */
router.post("/:id/run", async (req, res) => {

    try {

        const { sessionId } = req.body;

        const result = await runWorkflow(req.params.id, sessionId);

        res.json({
            ok: true,
            result
        });

    } catch (err) {

        res.status(500).json({
            ok: false,
            error: err.message
        });
    }
});

module.exports = router;