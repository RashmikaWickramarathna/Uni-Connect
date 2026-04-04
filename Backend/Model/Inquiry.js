const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  adminReply: { type: String, default: null },
  repliedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Inquiry", InquirySchema);
