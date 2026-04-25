const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../Model/Admin");

const JWT_SECRET = "your_secret_key_here"; // ⚠️ move to .env in production

// POST /api/admin/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ admin_username: email });
    if (!admin) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = admin.admin_pwd === password;
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign({ id: admin._id, email: admin.admin_username }, JWT_SECRET, { expiresIn: "2h" });
    res.status(200).json({ success: true, token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
});

// Auth middleware
function authMiddleware(req, res, next) {
  let token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  if (token.startsWith("Bearer ")) token = token.slice(7);

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.adminId = decoded.id;
    next();
  });
}

// GET /api/admin/dashboard
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to the secure admin dashboard!" });
});

module.exports = router;
