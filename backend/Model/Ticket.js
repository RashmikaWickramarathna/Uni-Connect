// backend/Model/Ticket.js
// UniConnect – Ticket Model

const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    // ── Event Reference ──────────────────────
    eventId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Event",
      required: true,
    },
    eventTitle: { type: String, required: true },
    eventDate:  { type: Date },
    venue:      { type: String },

    // ── Student Info ─────────────────────────
    studentName: { type: String, required: true },
    studentId:   { type: String, required: true },
    email:       { type: String, required: true },
    phone:       { type: String },
    faculty:     { type: String },

    // ── Ticket Details ───────────────────────
    ticketType: {
      type:    String,
      default: "general",
      trim: true,
    },
    ticketLabel: {
      type: String,
      default: "",
      trim: true,
    },
    quantity:    { type: Number, default: 1, min: 1 },
    unitPrice:   { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    // ── Payment Info ─────────────────────────
    paymentIntentId: {
      type:   String,
      sparse: true,
    },
    paymentStatus: {
      type:    String,
      enum:    ["paid", "pending", "failed", "not_required", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "online", "not_required"],
      default: "cash",
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // ── Ticket Status ────────────────────────
    status: {
      type:    String,
      enum:    ["pending", "confirmed", "cancelled", "used"],
      default: "pending",
    },

    // ── Check-in ─────────────────────────────
    checkedIn:   { type: Boolean, default: false },
    checkedInAt: { type: Date },

    // ── Cancellation ─────────────────────────
    cancellationReason: { type: String },
    cancelledAt:        { type: Date },

    // ── Timestamps ───────────────────────────
    bookedAt: { type: Date, default: Date.now },

    // ── Unique Ticket Number ─────────────────
    ticketNumber: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// ── Auto-generate Unique Ticket Number ───────
// Uses timestamp + random string to avoid duplicate key errors
// that occur when using countDocuments() after deletions
ticketSchema.pre("save", async function (next) {
  if (this.isNew && !this.ticketNumber) {
    const year      = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const random    = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ticketNumber = `UC-TKT-${year}-${timestamp}${random}`;
  }
  next();
});

// ── Indexes ───────────────────────────────────
ticketSchema.index({ studentId: 1, bookedAt: -1 });
ticketSchema.index({ eventId: 1, status: 1 });
ticketSchema.index({ status: 1 });

// ── Compound index to prevent duplicate bookings ──
ticketSchema.index(
  { eventId: 1, studentId: 1 },
  {
    unique:               true,
    partialFilterExpression: { status: { $in: ["confirmed", "pending"] } },
  }
);

// ── Virtuals ──────────────────────────────────
ticketSchema.virtual("isFree").get(function () {
  return this.totalAmount === 0;
});

ticketSchema.virtual("isUpcoming").get(function () {
  return this.eventDate && new Date(this.eventDate) > new Date();
});

// ── Statics ───────────────────────────────────
ticketSchema.statics.findByStudent = function (studentId) {
  return this.find({ studentId }).sort({ bookedAt: -1 });
};

ticketSchema.statics.findByEvent = function (eventId) {
  return this.find({ eventId }).sort({ bookedAt: -1 });
};

ticketSchema.statics.countConfirmedForEvent = function (eventId, ticketType) {
  const filter = { eventId, status: { $in: ["pending", "confirmed", "used"] } };
  if (ticketType) filter.ticketType = ticketType;
  return this.countDocuments(filter);
};

ticketSchema.statics.getEventRevenue = async function (eventId) {
  const result = await this.aggregate([
    {
      $match: {
        eventId:       new mongoose.Types.ObjectId(eventId),
        paymentStatus: "paid",
      },
    },
    {
      $group: {
        _id:   null,
        total: { $sum: "$totalAmount" },
        count: { $sum: "$quantity" },
      },
    },
  ]);
  return result[0] || { total: 0, count: 0 };
};

module.exports = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
