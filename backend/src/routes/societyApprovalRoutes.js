const express = require("express");
const router = express.Router();


const {
  verifyApprovalToken,
  useApprovalToken,
  approveSociety,
  rejectSociety
} = require("../controllers/societyApprovalController");

// Verify token (used by registration flow)
router.get("/verify/:token", verifyApprovalToken);

// Mark token as used
router.put("/use/:token", useApprovalToken);

// Approve society and auto-send link
router.post("/approve/:id", approveSociety);

// Reject society
router.post("/reject/:id", rejectSociety);

module.exports = router;