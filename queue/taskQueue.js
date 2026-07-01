/**
 * ==========================================================
 * TASK QUEUE (SIMPLE IN-MEMORY)
 * ==========================================================
 */

const queue = [];
let processing = false;

async function addTask(taskFn) {

    return new Promise((resolve, reject) => {

        queue.push({
            taskFn,
            resolve,
            reject
        });

        processQueue();
    });
}

async function processQueue() {

    if (processing) return;

    processing = true;

    while (queue.length > 0) {

        const item = queue.shift();

        try {
            const result = await item.taskFn();
            item.resolve(result);
        } catch (error) {
            item.reject(error);
        }
    }

    processing = false;
}

function getQueueSize() {
    return queue.length;
}

module.exports = {
    addTask,
    getQueueSize
};