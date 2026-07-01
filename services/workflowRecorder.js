const workflows = new Map();

/**
 * INIT WORKFLOW
 */
function createWorkflow(sessionId) {

    const workflowId = `${sessionId}_${Date.now()}`;

    workflows.set(workflowId, {
        id: workflowId,
        sessionId,
        steps: [],
        createdAt: Date.now()
    });

    return workflowId;
}

/**
 * ADD STEP
 */
function addStep(workflowId, step) {

    const wf = workflows.get(workflowId);

    if (!wf) throw new Error("Workflow not found");

    wf.steps.push({
        ...step,
        timestamp: Date.now()
    });
}

/**
 * GET WORKFLOW
 */
function getWorkflow(workflowId) {

    return workflows.get(workflowId);
}

/**
 * LIST WORKFLOWS
 */
function listWorkflows() {
    return Array.from(workflows.values());
}

module.exports = {
    createWorkflow,
    addStep,
    getWorkflow,
    listWorkflows
};