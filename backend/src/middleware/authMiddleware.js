// backend/src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────
// 🔐  Verify JWT Token
// Attaches decoded user to req.user
// ─────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, studentId, role, email, name }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please log in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    }
    return res.status(500).json({ message: "Token verification failed.", error: err.message });
  }
};

// ─────────────────────────────────────────────
// 🛡️  Role-Based Access Control
// Usage: authorizeRoles("admin", "staff")
// ─────────────────────────────────────────────
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

// ─────────────────────────────────────────────
// 👤  Owner or Admin Check
// Allows access if user is the resource owner OR admin/staff
// ─────────────────────────────────────────────
const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  const isAdmin = ["admin", "staff"].includes(req.user.role);
  const isOwner =
    req.params.studentId === req.user.studentId ||
    req.params.id === req.user.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({
      message: "Access denied. You can only access your own resources.",
    });
  }
  next();
};

// ─────────────────────────────────────────────
// 🔓  Optional Auth (does NOT block if no token)
// Attaches user if token present, continues regardless
// ─────────────────────────────────────────────
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
  } catch {
    // silently ignore invalid token for optional routes
  }
  next();
};

module.exports = { verifyToken, authorizeRoles, ownerOrAdmin, optionalAuth };