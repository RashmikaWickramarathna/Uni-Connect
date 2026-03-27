// backend/src/middleware/validationMiddleware.js

// ─────────────────────────────────────────────
// 🔧  Helper: send validation error
// ─────────────────────────────────────────────
const validationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });
};

// ─────────────────────────────────────────────
// 🎟️  Validate Ticket Booking
// POST /api/tickets/book
// ─────────────────────────────────────────────
const validateBookTicket = (req, res, next) => {
  const { eventId, studentName, studentId, email, quantity, ticketType } = req.body;
  const errors = [];

  if (!eventId) errors.push({ field: "eventId", message: "Event ID is required" });
  if (!studentName || studentName.trim().length < 2)
    errors.push({ field: "studentName", message: "Student name must be at least 2 characters" });
  if (!studentId || studentId.trim().length < 3)
    errors.push({ field: "studentId", message: "Student ID is required" });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push({ field: "email", message: "A valid email address is required" });
  if (quantity !== undefined && (isNaN(quantity) || Number(quantity) < 1))
    errors.push({ field: "quantity", message: "Quantity must be a positive number" });

  const validTicketTypes = ["general", "vip", "early_bird", "student", "complimentary"];
  if (ticketType && !validTicketTypes.includes(ticketType))
    errors.push({ field: "ticketType", message: `Invalid ticket type. Must be one of: ${validTicketTypes.join(", ")}` });

  if (errors.length > 0) return validationError(res, errors);
  next();
};

// ─────────────────────────────────────────────
// 💳  Validate Save Payment
// POST /api/payments/save
// ─────────────────────────────────────────────
const validateSavePayment = (req, res, next) => {
  const { amount, studentId, paymentType, paymentMethod } = req.body;
  const errors = [];

  if (amount === undefined || amount === null || isNaN(amount) || Number(amount) < 0)
    errors.push({ field: "amount", message: "Amount must be a non-negative number" });
  if (!studentId || studentId.trim().length < 3)
    errors.push({ field: "studentId", message: "Student ID is required" });

  const validPaymentTypes = ["ticket_booking", "shop_rent", "license_fee", "penalty", "property_tax", "other"];
  if (paymentType && !validPaymentTypes.includes(paymentType))
    errors.push({ field: "paymentType", message: `Invalid payment type. Must be one of: ${validPaymentTypes.join(", ")}` });

  const validPaymentMethods = ["cash", "bank_transfer", "online", "other"];
  if (paymentMethod && !validPaymentMethods.includes(paymentMethod))
    errors.push({ field: "paymentMethod", message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(", ")}` });

  if (errors.length > 0) return validationError(res, errors);
  next();
};

// ─────────────────────────────────────────────
// ✅  Validate Confirm Payment
// PATCH /api/payments/:id/confirm
// ─────────────────────────────────────────────
const validateConfirmPayment = (req, res, next) => {
  const { paymentMethod } = req.body;
  const errors = [];

  const validMethods = ["cash", "bank_transfer", "online", "other"];
  if (paymentMethod && !validMethods.includes(paymentMethod))
    errors.push({ field: "paymentMethod", message: `Invalid payment method. Must be one of: ${validMethods.join(", ")}` });

  if (errors.length > 0) return validationError(res, errors);
  next();
};

// ─────────────────────────────────────────────
// 🔍  Validate MongoDB ObjectId param
// Usage: router.get("/:id", validateObjectId, handler)
// ─────────────────────────────────────────────
const validateObjectId = (req, res, next) => {
  const id = req.params.id || req.params.eventId || req.params.ticketId;
  const objectIdRegex = /^[a-fA-F0-9]{24}$/;

  if (id && !objectIdRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: "${id}"`,
    });
  }
  next();
};

// ─────────────────────────────────────────────
// ❌  Validate Cancel Ticket
// PATCH /api/tickets/:ticketNumber/cancel
// ─────────────────────────────────────────────
const validateCancelTicket = (req, res, next) => {
  const { reason } = req.body;

  if (reason && reason.trim().length > 500) {
    return validationError(res, [
      { field: "reason", message: "Cancellation reason must be under 500 characters" },
    ]);
  }
  next();
};

module.exports = {
  validateBookTicket,
  validateSavePayment,
  validateConfirmPayment,
  validateObjectId,
  validateCancelTicket,
};