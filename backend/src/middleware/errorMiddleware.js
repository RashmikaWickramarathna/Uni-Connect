// backend/src/middleware/errorMiddleware.js

// ─────────────────────────────────────────────
// 🚫  404 Not Found Handler
// Place AFTER all route definitions
// ─────────────────────────────────────────────
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// ─────────────────────────────────────────────
// ❌  Global Error Handler
// Place as the LAST middleware in server.js
// ─────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";
  let details = undefined;

  // ── Mongoose Validation Error ──
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose Cast Error (invalid ObjectId) ──
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field "${err.path}": "${err.value}"`;
  }

  // ── Mongoose Duplicate Key ──
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value: "${field}" already exists.`;
    details = err.keyValue;
  }

  // ── JWT Errors ──
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired. Please log in again.";
  }

  // ── Log only server errors ──
  if (statusCode >= 500) {
    console.error(`❌ [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.error(err.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };