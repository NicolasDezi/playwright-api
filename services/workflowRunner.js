const { executeActions } = require("./actionExecutor");
const { getWorkflow } = require("./workflowRecorder");

/**
 * RUN STORED WORKFLOW
 */
async function runWorkflow(workflowId, sessionId) {

    const workflow = getWorkflow(workflowId);

    if (!workflow) {
        throw new Error("Workflow not found");
    }

    const result = await executeActions(
        workflow.steps,
        sessionId,
        {
            screenshot: true,
            debug: true,
            stopOnError: true
        }
    );

    return result;
}

module.exports = {
    runWorkflow
};