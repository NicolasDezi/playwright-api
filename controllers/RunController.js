const ActionExecutor = require("../services/actionExecutor");
const SessionService = require("../services/SessionService");

module.exports = {

    async run(req, res) {

        try {

            const {
                sessionId,
                actions,
                options = {}
            } = req.body;

            if (!sessionId) {
                return res.status(400).json({
                    ok: false,
                    error: "sessionId required"
                });
            }

            if (!actions || !Array.isArray(actions)) {
                return res.status(400).json({
                    ok: false,
                    error: "actions must be an array"
                });
            }

            /**
             * Verificar sesión activa
             */
            SessionService.get(sessionId);

            /**
             * Ejecutar acciones
             */
            const result = await ActionExecutor.execute(
                actions,
                sessionId,
                options
            );

            return res.json({
                ok: true,
                result
            });

        } catch (err) {

            console.error("[RUN ERROR]", err.message);

            return res.status(500).json({
                ok: false,
                error: err.message
            });

        }
    }

};