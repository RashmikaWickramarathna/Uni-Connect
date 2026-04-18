const express = require("express");

const { loginSociety } = require("../controllers/societyAuthController");

const router = express.Router();

router.post("/login", loginSociety);

module.exports = router;
