// backend/Routes/adminRoutes.js
// UniConnect – Admin Routes

const express = require("express");
const router  = express.Router();

const {
  getAllBookings,
  approveBooking,
  rejectBooking,
} = require("../controllers/adminController");

// GET  /api/admin/bookings               – get all ticket bookings
router.get("/bookings", getAllBookings);

// PATCH /api/admin/bookings/:id/approve  – manually approve cash booking
router.patch("/bookings/:id/approve", approveBooking);

// PATCH /api/admin/bookings/:id/reject   – reject booking with reason
router.patch("/bookings/:id/reject", rejectBooking);

module.exports = router;