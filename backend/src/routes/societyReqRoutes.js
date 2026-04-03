const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createSocietyRequest,
  getAllSocietyRequests,
  getSocietyRequestById,
  registerApprovedSociety,
} = require("../controllers/societyReqController");

router.post("/submit", upload.single("signatureLetter"), createSocietyRequest);
router.get("/", getAllSocietyRequests);
router.get("/:id", getSocietyRequestById);
router.post("/register-approved", registerApprovedSociety);

module.exports = router;