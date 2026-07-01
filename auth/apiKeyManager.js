const crypto = require("crypto");

const users = new Map();

/**
 * CREATE USER + API KEY
 */
function createUser(name) {

    const apiKey = crypto.randomBytes(24).toString("hex");

    const user = {
        id: crypto.randomUUID(),
        name,
        apiKey,
        createdAt: Date.now(),
        usage: {
            requests: 0
        }
    };

    users.set(apiKey, user);

    return user;
}

/**
 * GET USER BY API KEY
 */
function getUser(apiKey) {
    return users.get(apiKey);
}

/**
 * MIDDLEWARE AUTH
 */
function authMiddleware(req, res, next) {

    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
        return res.status(401).json({
            ok: false,
            error: "Missing API key"
        });
    }

    const user = getUser(apiKey);

    if (!user) {
        return res.status(401).json({
            ok: false,
            error: "Invalid API key"
        });
    }

    user.usage.requests++;

    req.user = user;

    next();
}

module.exports = {
    createUser,
    getUser,
    authMiddleware
};