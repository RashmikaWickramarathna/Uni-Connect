const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  mobile: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    required: true,
  },
  passwordResetOTP: {
    type: String,
    default: null,
  },
  passwordResetOTPExpiry: {
    type: Date,
    default: null,
  },
  isPasswordResetVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
