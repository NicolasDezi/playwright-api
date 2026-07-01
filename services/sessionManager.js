const sessions = new Map();

function createSession(id, data = {}) {
  if (!id) throw new Error("Session ID required");

  const session = {
    id,
    data,
    createdAt: Date.now(),
  };

  sessions.set(id, session);
  return session;
}

function getSession(id) {
  return sessions.get(id) || null;
}

function deleteSession(id) {
  return sessions.delete(id);
}

function getAllSessions() {
  return Array.from(sessions.values());
}

module.exports = {
  createSession,
  getSession,
  deleteSession,
  getAllSessions,
};