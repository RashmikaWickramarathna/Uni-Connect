// backend/src/middleware/rateLimitMiddleware.js
// ⚠️  Requires: npm install express-rate-limit

const rateLimit = require("express-rate-limit");

// ─────────────────────────────────────────────
// 🌐  General API Rate Limit
// 100 requests per 15 minutes per IP
// ─────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

// ─────────────────────────────────────────────
// 🎟️  Ticket Booking Rate Limit
// Prevent abuse: max 10 bookings per 15 minutes per IP
// ─────────────────────────────────────────────
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many booking attempts. Please wait 15 minutes before trying again.",
  },
});

// ─────────────────────────────────────────────
// 🔐  Auth / Login Rate Limit
// Prevent brute-force: max 10 attempts per 15 minutes
// ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

module.exports = { generalLimiter, bookingLimiter, authLimiter };