const router = require("express").Router();
const { databaseHealth } = require("../db/health");

router.get("/", async (req, res) => {

    const result = await databaseHealth();

    res.json(result);

});

module.exports = router;