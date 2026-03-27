// backend/src/Routes/PaymentRoute.js
const express = require("express");
const router = express.Router();

const {
  savePayment,
  confirmPayment,
  getPaymentById,
  getPaymentHistory,
  getAllPayments,
  getPaymentStats,
} = require("../controllers/paymentController");

const {
  validateSavePayment,
  validateConfirmPayment,
  validateObjectId,
} = require("../src/middleware/validationMiddleware");

// ─────────────────────────────────────────────
// 🔓 Auth is disabled until login system is ready
// TODO: re-add verifyToken, authorizeRoles, ownerOrAdmin
//       once your User/Auth module is built
// ─────────────────────────────────────────────

// POST /api/payments/save
router.post("/save", validateSavePayment, savePayment);

// PATCH /api/payments/:id/confirm
router.patch("/:id/confirm", validateObjectId, validateConfirmPayment, confirmPayment);

// GET /api/payments/stats
router.get("/stats", getPaymentStats);

// GET /api/payments/all
router.get("/all", getAllPayments);

// GET /api/payments/history/:studentId
router.get("/history/:studentId", getPaymentHistory);

// GET /api/payments/:id
router.get("/:id", validateObjectId, getPaymentById);

module.exports = router;