const express = require("express");
const router = express.Router();

const {
  createApprovalToken,
  verifyApprovalToken,
  useApprovalToken
} = require("../controllers/societyApprovalController");

// Create token
router.post("/create", createApprovalToken);

// Verify token
router.get("/verify/:token", verifyApprovalToken);

// Mark token as used
router.put("/use/:token", useApprovalToken);

module.exports = router;