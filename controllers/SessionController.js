const SessionService = require("../services/SessionService");

module.exports = {

    async create(req, res) {

        try {

            const session = await SessionService.create();

            res.json({
                ok: true,
                session
            });

        } catch (err) {

            res.status(500).json({
                ok: false,
                error: err.message
            });

        }

    },

    async close(req, res) {

        try {

            const { sessionId } = req.body;

            await SessionService.close(sessionId);

            res.json({ ok: true });

        } catch (err) {

            res.status(500).json({
                ok: false,
                error: err.message
            });

        }

    }

};