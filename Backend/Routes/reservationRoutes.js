const express = require("express");
const router = express.Router();
const reservationController = require("../Controllers/reservationController");

router.get("/availability", reservationController.getAvailability);
router.post("/", reservationController.createReservation);
router.get("/", reservationController.getReservations);
router.put("/:id", reservationController.updateReservation); // NEW
router.delete("/:id", reservationController.cancelReservation);

module.exports = router;
