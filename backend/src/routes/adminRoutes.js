const express = require("express");
const jwt = require("jsonwebtoken");

const Admin = require("../models/admin");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ admin_username: email });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = admin.admin_pwd === password;
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.admin_username },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({ success: true, token, message: "Login successful" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  return jwt.verify(token, JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.adminId = decoded.id;
    return next();
  });
};

router.get("/dashboard", authMiddleware, (_req, res) => {
  res.json({ message: "Welcome to the secure admin dashboard!" });
});

module.exports = router;
