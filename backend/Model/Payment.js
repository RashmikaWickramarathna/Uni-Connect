// backend/src/Model/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // ── Amount ──────────────────────────────
    amount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    currency: { type: String, default: "LKR" },

    // ── Payer Info ───────────────────────────
    applicantName: { type: String },
    studentId: { type: String, index: true },
    email: { type: String },

    // ── Payment Classification ───────────────
    paymentType: {
      type: String,
      enum: ["ticket_booking", "shop_rent", "license_fee", "penalty", "property_tax", "other"],
      required: true,
      default: "ticket_booking",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "online", "other"],
      default: "cash",
    },

    // ── Event / Ticket Link ──────────────────
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    eventName: { type: String },
    ticketType: { type: String },
    ticketLabel: { type: String },
    quantity: { type: Number, default: 1 },
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },

    // ── Dates ────────────────────────────────
    paymentDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paymentPeriod: {
      month: {
        type: Number, min: 1, max: 12,
        default: () => new Date().getMonth() + 1,
      },
      year: {
        type: Number,
        default: () => new Date().getFullYear(),
      },
    },

    // ── Receipt ──────────────────────────────
    receiptNumber: { type: String, unique: true, sparse: true },
    notes: { type: String },

    // ── Additional Info ──────────────────────
    metadata: {
      description: { type: String },
      processedBy: { type: String },
    },
  },
  { timestamps: true }
);

// Auto-generate receipt number
paymentSchema.pre("save", async function (next) {
  if (this.isNew && !this.receiptNumber) {
    const count = await mongoose.model("Payment").countDocuments();
    const year = new Date().getFullYear();
    this.receiptNumber = `UC-RCP-${year}-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

paymentSchema.index({ studentId: 1, paymentDate: -1 });
paymentSchema.index({ eventId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentType: 1 });

paymentSchema.virtual("formattedAmount").get(function () {
  return `Rs. ${(this.amount || 0).toLocaleString()}`;
});

paymentSchema.statics.findByStudent = function (studentId) {
  return this.find({ studentId }).sort({ paymentDate: -1 });
};

paymentSchema.statics.findByEvent = function (eventId) {
  return this.find({ eventId }).sort({ paymentDate: -1 });
};

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
