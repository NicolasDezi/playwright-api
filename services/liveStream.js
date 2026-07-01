const WebSocket = require("ws");

const clients = new Map();

/**
 * ==========================================================
 * REGISTER CLIENT
 * ==========================================================
 */
function registerClient(sessionId, ws) {

    if (!clients.has(sessionId)) {
        clients.set(sessionId, new Set());
    }

    clients.get(sessionId).add(ws);

    console.log(`[STREAM] Client connected to session ${sessionId}`);
}

/**
 * ==========================================================
 * REMOVE CLIENT
 * ==========================================================
 */
function removeClient(sessionId, ws) {

    if (!clients.has(sessionId)) return;

    clients.get(sessionId).delete(ws);
}

/**
 * ==========================================================
 * BROADCAST FRAME
 * ==========================================================
 */
function broadcastFrame(sessionId, frame) {

    if (!clients.has(sessionId)) return;

    const data = JSON.stringify({
        type: "frame",
        sessionId,
        timestamp: Date.now(),
        image: frame
    });

    for (const ws of clients.get(sessionId)) {

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    }
}

module.exports = {
    registerClient,
    removeClient,
    broadcastFrame
};