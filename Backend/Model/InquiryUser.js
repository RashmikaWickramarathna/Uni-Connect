const mongoose = require("mongoose");

const InquiryUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: "InquiryManagement" });

module.exports = mongoose.model("InquiryUser", InquiryUserSchema);
