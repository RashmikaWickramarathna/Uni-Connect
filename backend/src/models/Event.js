const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society"
    },
    societyRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocietyRequest"
    },
    title: {

      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    eventDate: {
      type: Date,
      required: true
    },
    venue: {
      type: String,
      required: true
    },
    category: String,
    maxAttendees: Number,
    image: String,
    status: {
      type: String,
      enum: ["draft", "pending", "published", "cancelled"],
      default: "draft"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.SocietyEvent || mongoose.model("SocietyEvent", eventSchema);

