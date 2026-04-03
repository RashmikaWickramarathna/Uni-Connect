// backend/controllers/adminController.js
// UniConnect – Admin Controller

const Ticket  = require("../Model/Ticket");
const Payment = require("../Model/Payment");
const Event   = require("../Model/Event");

// ─────────────────────────────────────────────
// 📋  Get All Bookings
// GET /api/admin/bookings
// ─────────────────────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .sort({ bookedAt: -1 })
      .populate("eventId", "title date venue organizer");

    res.json(tickets);
  } catch (err) {
    console.error("❌ Get All Bookings Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// ✅  Approve Booking (Cash only – manual)
// PATCH /api/admin/bookings/:id/approve
// ─────────────────────────────────────────────
const approveBooking = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    if (ticket.status === "confirmed") {
      return res.status(400).json({ message: "Ticket is already confirmed" });
    }
    if (ticket.status === "cancelled") {
      return res.status(400).json({ message: "Cannot approve a cancelled ticket" });
    }
    if (ticket.paymentMethod !== "cash") {
      return res.status(400).json({
        message: `Only cash payments require manual approval. This ticket uses "${ticket.paymentMethod}" which is auto-processed.`,
      });
    }

    ticket.status        = "confirmed";
    ticket.paymentStatus = "paid";
    await ticket.save();

    if (ticket.paymentId) {
      await Payment.findByIdAndUpdate(ticket.paymentId, {
        status:     "completed",
        amountPaid: ticket.totalAmount,
      });
    }

    res.json({ message: "Ticket approved successfully", ticket });
  } catch (err) {
    console.error("❌ Approve Booking Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// ❌  Reject Booking
// PATCH /api/admin/bookings/:id/reject
// Body: { reason }
// ─────────────────────────────────────────────
const rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    if (ticket.status === "cancelled") {
      return res.status(400).json({ message: "Ticket is already rejected/cancelled" });
    }
    if (ticket.status === "used") {
      return res.status(400).json({ message: "Cannot reject a used ticket" });
    }

    ticket.status             = "cancelled";
    ticket.paymentStatus      = "failed";
    ticket.cancellationReason = reason || "Rejected by admin";
    ticket.cancelledAt        = new Date();
    await ticket.save();

    // Restore seat count
    await Event.findByIdAndUpdate(ticket.eventId, {
      $inc: { bookedSeats: -ticket.quantity },
    });

    // Update linked payment
    if (ticket.paymentId) {
      await Payment.findByIdAndUpdate(ticket.paymentId, { status: "failed" });
    }

    res.json({ message: "Ticket rejected successfully", ticket });
  } catch (err) {
    console.error("❌ Reject Booking Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// ⚡  Auto-process non-cash payments
//     Called from ticketBookingController after booking
// ─────────────────────────────────────────────
const autoProcessPayment = async (ticket, payment) => {
  try {
    if (ticket.paymentMethod === "cash" || ticket.paymentMethod === "not_required") {
      return; // cash = wait for admin, free = already handled
    }

    // bank_transfer and online = auto approve
    ticket.status        = "confirmed";
    ticket.paymentStatus = "paid";
    await ticket.save();

    if (payment) {
      payment.status     = "completed";
      payment.amountPaid = ticket.totalAmount;
      await payment.save();
    }

    console.log(`⚡ Auto-approved ticket ${ticket.ticketNumber} (${ticket.paymentMethod})`);
  } catch (err) {
    console.error("❌ Auto-process payment error:", err);
  }
};

module.exports = {
  getAllBookings,
  approveBooking,
  rejectBooking,
  autoProcessPayment,
};