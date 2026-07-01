const crypto = require("crypto");
const db = require("../db");

async function createUser(name) {

    const user = {
        id: crypto.randomUUID(),
        name,
        apiKey: crypto.randomBytes(24).toString("hex"),
        createdAt: Date.now()
    };

    await db.query(
        `INSERT INTO users (id, name, api_key, created_at)
         VALUES ($1, $2, $3, $4)`,
        [user.id, user.name, user.apiKey, user.createdAt]
    );

    return user;
}

async function getUserByKey(apiKey) {

    const res = await db.query(
        `SELECT * FROM users WHERE api_key = $1`,
        [apiKey]
    );

    return res.rows[0];
}

async function authMiddleware(req, res, next) {

    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
        return res.status(401).json({
            ok: false,
            error: "Missing API key"
        });
    }

    const user = await getUserByKey(apiKey);

    if (!user) {
        return res.status(401).json({
            ok: false,
            error: "Invalid API key"
        });
    }

    req.user = user;
    next();
}

module.exports = {
    createUser,
    getUserByKey,
    authMiddleware
};