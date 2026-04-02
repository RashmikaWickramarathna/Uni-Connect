const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    date: {
      type: String, // stored as "YYYY-MM-DD"
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
    },
    category: {
      type: String,
      enum: ["Academic", "Sports", "Cultural", "Social", "Workshop", "Other"],
      default: "Other",
    },
    organizer: {
      type: String,
      required: [true, "Organizer name is required"],
    },
    maxParticipants: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);