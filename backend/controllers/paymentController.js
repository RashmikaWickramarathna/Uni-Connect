// backend/src/controllers/paymentController.js
const Payment = require("../Model/Payment");
const Ticket = require("../Model/Ticket");

// ─────────────────────────────────────────────
// 💾  Create & Save Payment Record
// POST /api/payments/save
// ─────────────────────────────────────────────
const savePayment = async (req, res) => {
  try {
    const {
      amount,
      applicantName,
      studentName,
      studentId,
      email,
      paymentType = "ticket_booking",
      paymentMethod = "cash",
      eventId,
      eventName,
      ticketType,
      quantity = 1,
      ticketId,
      notes,
    } = req.body;

    if (!amount || amount < 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const nameToSave = studentName || applicantName;
    const currentDate = new Date();

    const payment = new Payment({
      amount,
      amountPaid: amount,
      applicantName: nameToSave,
      studentId,
      email,
      paymentType,
      paymentMethod,
      status: amount === 0 ? "completed" : "pending",
      paymentDate: currentDate,
      paymentPeriod: {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      },
      eventId: eventId || undefined,
      eventName,
      ticketType,
      quantity,
      ticketId: ticketId || undefined,
      notes,
      metadata: {
        description: eventName
          ? `Ticket – ${eventName} (${ticketType || "general"} × ${quantity})`
          : paymentType,
      },
    });

    await payment.save();

    res.status(201).json({
      message: "Payment record created successfully",
      payment,
      receiptNumber: payment.receiptNumber,
    });
  } catch (err) {
    console.error("❌ Save Payment Error:", err);
    res.status(500).json({ error: err.message, details: err.errors });
  }
};

// ─────────────────────────────────────────────
// ✅  Mark Payment as Completed (Admin)
// PATCH /api/payments/:id/confirm
// ─────────────────────────────────────────────
const confirmPayment = async (req, res) => {
  try {
    const { paymentMethod, notes } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    if (payment.status === "completed") {
      return res.status(400).json({ message: "Payment is already completed" });
    }

    payment.status = "completed";
    payment.amountPaid = payment.amount;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (notes) payment.notes = notes;
    payment.paymentDate = new Date();
    await payment.save();

    // Also update the linked ticket
    if (payment.ticketId) {
      await Ticket.findByIdAndUpdate(payment.ticketId, {
        paymentStatus: "paid",
        status: "confirmed",
        paymentMethod: paymentMethod || payment.paymentMethod,
      });
    }

    res.json({ message: "Payment confirmed successfully", payment });
  } catch (err) {
    console.error("❌ Confirm Payment Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 🔍  Get Payment by ID
// GET /api/payments/:id
// ─────────────────────────────────────────────
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("eventId", "title date venue");
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  } catch (err) {
    console.error("❌ Get Payment Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 📜  Payment History by Student ID
// GET /api/payments/history/:studentId
// ─────────────────────────────────────────────
const getPaymentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const payments = await Payment.find({ studentId })
      .sort({ paymentDate: -1 })
      .populate("eventId", "title date venue");
    res.json(payments);
  } catch (err) {
    console.error("❌ Payment History Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 📋  Get All Payments (Admin)
// GET /api/payments/all?page=1&limit=20&status=pending&paymentType=ticket_booking
// ─────────────────────────────────────────────
const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentType } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentType) filter.paymentType = paymentType;

    const payments = await Payment.find(filter)
      .sort({ paymentDate: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("eventId", "title");

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("❌ Get All Payments Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 📊  Payment Statistics
// GET /api/payments/stats
// ─────────────────────────────────────────────
const getPaymentStats = async (req, res) => {
  try {
    const byStatus = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amountPaid" },
          count: { $sum: 1 },
        },
      },
    ]);

    const byType = await Payment.aggregate([
      {
        $group: {
          _id: "$paymentType",
          totalAmount: { $sum: "$amountPaid" },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: {
            year: "$paymentPeriod.year",
            month: "$paymentPeriod.month",
          },
          revenue: { $sum: "$amountPaid" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.json({ byStatus, byType, monthlyRevenue });
  } catch (err) {
    console.error("❌ Payment Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  savePayment,
  confirmPayment,
  getPaymentById,
  getPaymentHistory,
  getAllPayments,
  getPaymentStats,
};