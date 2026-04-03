const express = require("express");
const router = express.Router();


const {
  verifyApprovalToken,
  useApprovalToken,
  approveSociety,
  rejectSociety,
  openApprovalLink,
  sendEventLink
} = require("../controllers/societyApprovalController");

// Verify token (used by registration flow)
router.get("/verify/:token", verifyApprovalToken);

// Open token link and redirect to frontend registration
router.get("/open/:token", openApprovalLink);

// Send event access link to approved society (admin action)
router.post("/send-event-link/:id", sendEventLink);

// Mark token as used
router.put("/use/:token", useApprovalToken);

// Approve society and auto-send link
router.post("/approve/:id", approveSociety);

// Reject society
router.post("/reject/:id", rejectSociety);

module.exports = router;