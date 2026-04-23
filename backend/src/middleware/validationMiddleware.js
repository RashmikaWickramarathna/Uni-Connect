// backend/src/middleware/validationMiddleware.js

// ─────────────────────────────────────────────
// 🔧  Helper: send validation error
// ─────────────────────────────────────────────
// const { escape } = require('lodash'); // lodash not installed
const mongoose = require('mongoose');

const validationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });
};

// ─────────────────────────────────────────────
// 🔧 Helper: Sanitize input
// ─────────────────────────────────────────────
const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/[&<>\\"']/g, '');
};

const validFaculties = [
  "Faculty of Computing", "Faculty of architecture", "Faculty of Business", "Faculty of Humanity",
  "Management",  "Other"
];

const lowercaseValidFaculties = validFaculties.map(f => f.toLowerCase());

// ─────────────────────────────────────────────
// 📞 Validate Phone (Sri Lanka)
// ─────────────────────────────────────────────
const validatePhone = (phone) => {
  return /^07[0-9]{8}$/.test(phone?.trim() || '');
};

// ─────────────────────────────────────────────
// 🎟️  Validate Ticket Booking
// POST /api/tickets/book
// ─────────────────────────────────────────────
const validateBookTicket = (req, res, next) => {
  const { 
    eventId, 
    studentName, 
    studentId, 
    email, 
    phone, 
    faculty, 
    quantity, 
    ticketType 
  } = req.body;
  const errors = [];

  // Required fields
  if (!mongoose.isValidObjectId(eventId)) 
    errors.push({ field: "eventId", message: "Valid Event ID is required" });
  if (!studentName || sanitizeInput(studentName).length < 2 || sanitizeInput(studentName).length > 100)
    errors.push({ field: "studentName", message: "Student name: 2-100 characters required" });
  // Student ID format: MUST start with "it" (case-insensitive) + exactly 8 digits
  const studentIdRegex = /^it[0-9]{8}$/i;
  if (!studentId || !studentIdRegex.test(sanitizeInput(studentId)))
    errors.push({ field: "studentId", message: 'Student ID must start with "it" + 8 digits (e.g. it23711228, IT23711228)' });
  if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitizeInput(email)))
    errors.push({ field: "email", message: "Valid email address is required" });

  // Optional but validated
  if (phone && !validatePhone(phone))
    errors.push({ field: "phone", message: "Sri Lanka phone: 07XXXXXXXX format" });
if (faculty && !lowercaseValidFaculties.includes(sanitizeInput(faculty).toLowerCase()))
    errors.push({ field: "faculty", message: `Valid faculty required: ${validFaculties.join(", ")}` });

  // Quantity: 1-10 max
  const qty = Number(quantity);
  if (qty !== undefined && (isNaN(qty) || qty < 1 || qty > 10))
    errors.push({ field: "quantity", message: "Quantity: 1-10 tickets allowed" });

  const validTicketTypes = ["general", "vip", "early_bird", "student", "complimentary"];
  if (ticketType && !validTicketTypes.includes(ticketType))
    errors.push({ field: "ticketType", message: `Valid types: ${validTicketTypes.join(", ")}` });

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
// 🗓️ Validate Event Creation (Admin POST)
// ─────────────────────────────────────────────
const validateCreateEvent = (req, res, next) => {
  const { title, date, venue, category, tickets } = req.body;
  const errors = [];

  if (!title || sanitizeInput(title).length < 5 || sanitizeInput(title).length > 200)
    errors.push({ field: "title", message: "Event title: 5-200 characters" });
  if (!date || isNaN(Date.parse(date)))
    errors.push({ field: "date", message: "Valid future date required" });
  if (!venue || sanitizeInput(venue).length < 3)
    errors.push({ field: "venue", message: "Venue: minimum 3 characters" });

  const validCategories = ["academic", "cultural", "sports", "tech", "workshop", "seminar", "social", "other"];
  if (category && !validCategories.includes(category))
    errors.push({ field: "category", message: `Valid category: ${validCategories.join(", ")}` });

  // Tickets array validation
  if (tickets && !Array.isArray(tickets))
    errors.push({ field: "tickets", message: "Tickets must be an array" });
  else if (tickets) {
    tickets.forEach((t, i) => {
      if (!t.type || !["general", "vip", "early_bird", "student", "complimentary"].includes(t.type))
        errors.push({ field: `tickets[${i}].type`, message: "Valid ticket type required" });
      if (t.totalSeats === undefined || t.totalSeats < 1 || t.totalSeats > 10000)
        errors.push({ field: `tickets[${i}].totalSeats`, message: "Seats: 1-10000" });
      if (t.price !== undefined && (t.price < 0 || t.price > 1000000))
        errors.push({ field: `tickets[${i}].price`, message: "Price: 0-1,000,000 LKR" });
    });
  }

  if (errors.length > 0) return validationError(res, errors);
  next();
};

// ─────────────────────────────────────────────
// ✏️ Validate Event Update (Admin PUT)
// ─────────────────────────────────────────────
const validateUpdateEvent = (req, res, next) => {
  validateCreateEvent(req, res, next); // Reuse most rules
};

// ─────────────────────────────────────────────
// 🛡️ Admin Booking Actions (:id params)
// ─────────────────────────────────────────────
const validateAdminBookingAction = (req, res, next) => {
  validateObjectId(req, res, () => {
    // Additional booking-specific checks if needed
    next();
  });
};

// ─────────────────────────────────────────────
// ❌  Validate Cancel Ticket (Enhanced)
// ─────────────────────────────────────────────
const validateCancelTicket = (req, res, next) => {
  const { reason } = req.body;
  if (reason) {
    const cleanReason = sanitizeInput(reason);
    if (cleanReason.length < 5 || cleanReason.length > 500)
      return validationError(res, [{ field: "reason", message: "Reason: 5-500 characters" }]);
  }
  next();
};

module.exports = {
  validateBookTicket,
  validateSavePayment,
  validateConfirmPayment,
  validateObjectId,
  validateCancelTicket,
  validateCreateEvent,
  validateUpdateEvent,
  validateAdminBookingAction,
  sanitizeInput, // Export for controllers if needed
};
