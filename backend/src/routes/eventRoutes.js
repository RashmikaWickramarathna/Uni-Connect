const express = require("express");
const router = express.Router();
const { verifyEventToken, createEvent } = require("../controllers/eventController");

// Verify event access token
router.get("/verify-event-token/:token", verifyEventToken);

// Create new event (protected by token in params)
router.post("/:token", createEvent);

module.exports = router;

