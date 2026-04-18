// backend/Routes/ticketBookingRoutes.js
const express = require("express");
const router  = express.Router();

const {
  createTicketPaymentIntent,
  bookTicket,
  getTicketByNumber,
  getTicketsByStudent,
  getTicketsByEvent,
  cancelTicket,
  checkInTicket,
  getTicketStats,
  verifyStudentTicket,
} = require("../controllers/ticketBookingController");

const {
  validateBookTicket,
  validateCancelTicket,
} = require("../src/middleware/validationMiddleware");

// ─────────────────────────────────────────────
// 🔓 Auth disabled until login system is ready
// ─────────────────────────────────────────────

// GET  /api/tickets/stats
router.get("/stats", getTicketStats);

// POST /api/tickets/create-intent
router.post("/create-intent", validateBookTicket, createTicketPaymentIntent);

// POST /api/tickets/book
router.post("/book", validateBookTicket, bookTicket);

// GET  /api/tickets/verify/:studentId/:email  ← NEW SECURE ENDPOINT
router.get("/verify/:studentId/:email", verifyStudentTicket);

// GET  /api/tickets/student/:studentId
router.get("/student/:studentId", getTicketsByStudent);

// GET  /api/tickets/event/:eventId
router.get("/event/:eventId", getTicketsByEvent);

// GET  /api/tickets/:ticketNumber
router.get("/:ticketNumber", getTicketByNumber);

// PATCH /api/tickets/:ticketNumber/cancel
router.patch("/:ticketNumber/cancel", validateCancelTicket, cancelTicket);

// PATCH /api/tickets/:ticketNumber/checkin
router.patch("/:ticketNumber/checkin", checkInTicket);

module.exports = router;
