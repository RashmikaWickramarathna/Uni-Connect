const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientEmail: { type: String, required: true, lowercase: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  eventTitle: { type: String },
  type: { type: String, enum:["approved","rejected","deleted","reminder","upcoming"], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);