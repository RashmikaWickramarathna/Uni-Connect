const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  eventTitle: { type: String, required: true },
  eventDate: { type: String, required: true },
  organizerEmail: { type: String, required: true },
  reminderType: { type: String, enum:["7_days","1_day"], required: true },
  message: { type: String },
  sentAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Reminder", reminderSchema);