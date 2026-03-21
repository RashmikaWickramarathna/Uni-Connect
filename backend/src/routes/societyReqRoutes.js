const express = require("express");
const router = express.Router();
const { createSocietyRequest, getAllSocietyRequests,getSocietyRequestById, approveSocietyRequest, rejectSocietyRequest,registerApprovedSociety } = require("../controllers/societyReqController");

router.post("/submit", createSocietyRequest);
//Get all
router.get("/", getAllSocietyRequests);

//Get by ID
router.get("/:id", getSocietyRequestById);

router.put("/approve/:id", approveSocietyRequest);

router.put("/reject/:id", rejectSocietyRequest);

router.post("/register-approved", registerApprovedSociety);

module.exports = router;