// backend/src/Model/Event.js
const mongoose = require("mongoose");

const ticketTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["general", "vip", "early_bird", "student", "complimentary"],
    default: "general",
  },
  price: { type: Number, default: 0 },
  totalSeats: { type: Number, required: true, min: 1 },
  description: { type: String },
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Event title is required"], trim: true },
    description: { type: String, trim: true },
    shortDescription: { type: String, maxlength: 200 },
    date: { type: Date, required: [true, "Event date is required"] },
    endDate: { type: Date },
    registrationDeadline: { type: Date },
    venue: { type: String, required: [true, "Venue is required"], trim: true },
    location: {
      address: { type: String },
      city: { type: String, default: "Colombo" },
      mapLink: { type: String },
    },
    organizer: { type: String, trim: true },
    organizerContact: {
      email: { type: String },
      phone: { type: String },
    },
    bannerImage: { type: String, default: "" },
    images: [{ type: String }],
    tickets: [ticketTypeSchema],
    totalSeats: { type: Number, default: 0 },
    bookedSeats: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "upcoming", "active", "completed", "cancelled"],
      default: "upcoming",
    },
    category: {
      type: String,
      enum: ["academic", "cultural", "sports", "tech", "workshop", "seminar", "social", "other"],
      default: "other",
    },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    requirements: { type: String },
    agenda: { type: String },
    speakers: [
      {
        name: { type: String },
        title: { type: String },
        bio: { type: String },
        photo: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Auto-calculate totalSeats from ticket types
eventSchema.pre("save", function (next) {
  if (this.tickets && this.tickets.length > 0) {
    this.totalSeats = this.tickets.reduce((sum, t) => sum + (t.totalSeats || 0), 0);
  }
  next();
});

eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ isPublished: 1 });
eventSchema.index({ title: "text", description: "text" });

eventSchema.virtual("availableSeats").get(function () {
  return this.totalSeats - this.bookedSeats;
});

eventSchema.virtual("isSoldOut").get(function () {
  return this.bookedSeats >= this.totalSeats;
});

eventSchema.virtual("isFree").get(function () {
  if (!this.tickets || this.tickets.length === 0) return true;
  return this.tickets.every((t) => t.price === 0);
});

eventSchema.statics.getUpcoming = function () {
  return this.find({
    isPublished: true,
    date: { $gte: new Date() },
    status: { $in: ["upcoming", "active"] },
  }).sort({ date: 1 });
};

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);