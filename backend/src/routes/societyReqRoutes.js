const express = require("express");
const router = express.Router();
const { createSocietyRequest } = require("../controllers/societyReqController");

router.post("/submit", createSocietyRequest);

module.exports = router;