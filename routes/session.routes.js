const router = require("express").Router();
const SessionController = require("../controllers/SessionController");

router.post("/create", SessionController.create);

router.post("/close", SessionController.close);

module.exports = router;