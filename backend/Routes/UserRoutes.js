const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyUser, resetPassword, forgotPassword, verifyOTP, getUser, updateUser, deleteUser } = require("../Controllers/UserController");

// POST /api/users/signup → Register user
router.post("/signup", registerUser);

// POST /api/users/login → Login user
router.post("/login", loginUser);

// POST /api/users/verify → Verify email + mobile for forgot password
router.post("/verify", verifyUser);

// PUT /api/users/reset-password → Reset password
router.put("/reset-password", resetPassword);

// POST /api/users/forgot-password → Send OTP to email
router.post("/forgot-password", forgotPassword);

// POST /api/users/verify-otp → Verify OTP
router.post("/verify-otp", verifyOTP);

// GET /api/users/:id → Get user by ID
router.get("/:id", getUser);

// PUT /api/users/:id → Update user
router.put("/:id", updateUser);

// DELETE /api/users/:id → Delete user
router.delete("/:id", deleteUser);

module.exports = router;
