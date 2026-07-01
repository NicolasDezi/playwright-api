const router = require("express").Router();
const RunController = require("../controllers/RunController");

/**
 * Ejecuta acciones en una sesión existente
 */
router.post("/", RunController.run);

module.exports = router;