const mongoose = require("mongoose");

const FeedbackUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: "FeedbackManagement" });

module.exports = mongoose.model("FeedbackUser", FeedbackUserSchema);
