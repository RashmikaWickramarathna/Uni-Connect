// backend/controllers/ticketBookingController.js
// UniConnect – Ticket Booking Controller

let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  } catch (error) {
    console.warn('Stripe SDK is unavailable. Install the "stripe" package to enable online payment intents.');
  }
}
const Ticket = require("../Model/Ticket");
const Event  = require("../Model/Event");
const Payment = require("../Model/Payment");

const BOOKABLE_STATUSES = new Set(["approved", "published", "upcoming", "active"]);

const normalizePaymentMethod = (value, isFree) => {
  if (isFree) return "not_required";

  const normalized = String(value || "cash").trim().toLowerCase();
  return ["cash", "bank_transfer", "online"].includes(normalized) ? normalized : "cash";
};

// ─────────────────────────────────────────────
// 🎟️  Create Stripe Payment Intent for a Ticket
// POST /api/tickets/create-intent
// ─────────────────────────────────────────────
const createTicketPaymentIntent = async (req, res) => {
  try {
    const {
      eventId,
      studentName,
      studentId,
      email,
      ticketType = "general",
      quantity   = 1,
    } = req.body;

    // Validate event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (!BOOKABLE_STATUSES.has(String(event.status).toLowerCase()) && !event.isPublished) {
      return res.status(400).json({ message: "This event is not available for booking" });
    }

    // ── Prevent same student booking same event twice ──
    const existingBooking = await Ticket.findOne({
      eventId,
      studentId,
      status: { $in: ["confirmed", "pending"] },
    });
    if (existingBooking) {
      return res.status(400).json({
        message: "You have already booked a ticket for this event.",
        ticketNumber: existingBooking.ticketNumber,
      });
    }

    // Find ticket config
    const ticketConfig = event.tickets?.find((t) => t.type === ticketType);
    if (!ticketConfig) {
      return res.status(400).json({
        message: `Ticket type "${ticketType}" not found for this event`,
      });
    }

    // Check seat availability
    const bookedCount = await Ticket.countConfirmedForEvent(eventId, ticketType);
    const available   = ticketConfig.totalSeats - bookedCount;

    if (available < quantity) {
      return res.status(400).json({
        message: `Only ${available} seat(s) remaining for "${ticketType}"`,
        availableSeats: available,
      });
    }

    const unitPrice   = ticketConfig.price || 0;
    const totalAmount = unitPrice * quantity;

    // Free ticket – skip Stripe
    if (totalAmount === 0) {
      return res.json({
        isFree:     true,
        message:    "This is a free event. Proceed to book directly.",
        totalAmount: 0,
        unitPrice:   0,
        quantity,
        eventTitle: event.title,
        eventDate:  event.date,
        venue:      event.venue,
      });
    }

    // Paid ticket – create Stripe intent
    if (!stripe) {
      return res.status(503).json({
        message: "Stripe is not configured. Online payment intents are unavailable in this environment.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(totalAmount * 100),
      currency: "lkr",
      metadata: {
        event_id:     eventId.toString(),
        event_name:   event.title,
        student_id:   studentId,
        student_name: studentName,
        email,
        ticket_type:  ticketType,
        quantity:     quantity.toString(),
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret:   paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalAmount,
      unitPrice,
      quantity,
      eventTitle:     event.title,
      eventDate:      event.date,
      venue:          event.venue,
      availableSeats: available,
    });
  } catch (err) {
    console.error("❌ Create Ticket Intent Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 📌  Book a Ticket (free or after Stripe payment)
// POST /api/tickets/book
// ─────────────────────────────────────────────
const bookTicket = async (req, res) => {
  try {
    const {
      eventId,
      studentName,
      studentId,
      email,
      phone,
      faculty,
      ticketType      = "general",
      quantity        = 1,
      paymentMethod: rawPaymentMethod,
      paymentDetails = null,
      paymentIntentId = null,
      stripeStatus    = "succeeded",
    } = req.body;

    // Validate event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Prevent duplicate booking for same paymentIntentId
    if (paymentIntentId) {
      const duplicate = await Ticket.findOne({ paymentIntentId });
      if (duplicate) {
        return res.json({
          message: "Ticket already booked for this payment",
          ticket:  duplicate,
        });
      }
    }

    // ── Prevent same student booking same event twice ──
    const existingBooking = await Ticket.findOne({
      eventId,
      studentId,
      status: { $in: ["confirmed", "pending"] },
    });
    if (existingBooking) {
      return res.status(400).json({
        message:      "You have already booked a ticket for this event.",
        ticketNumber: existingBooking.ticketNumber,
      });
    }

    const ticketConfig = event.tickets?.find((t) => t.type === ticketType);
    if (!ticketConfig) {
      return res.status(400).json({ message: `Ticket type "${ticketType}" not found` });
    }

    const bookedCount = await Ticket.countConfirmedForEvent(eventId, ticketType);
    if (ticketConfig.totalSeats - bookedCount < quantity) {
      return res.status(400).json({ message: "Seats are no longer available" });
    }

    const unitPrice   = ticketConfig.price || 0;
    const totalAmount = unitPrice * quantity;
    const isFree      = totalAmount === 0;
    const paymentMethod = normalizePaymentMethod(rawPaymentMethod, isFree);

    // Determine payment status
    let paymentStatus;
    if (isFree) {
      paymentStatus = "not_required";
    } else if (paymentMethod === "cash") {
      paymentStatus = "pending";
    } else if (stripeStatus === "succeeded" || ["bank_transfer", "online"].includes(paymentMethod)) {
      paymentStatus = "paid";
    } else {
      paymentStatus = "pending";
    }

    const ticketStatus =
      paymentStatus === "paid" || paymentStatus === "not_required"
        ? "confirmed"
        : "pending";

    let payment = null;
    if (paymentMethod !== "not_required" || isFree) {
      payment = new Payment({
        amount: totalAmount,
        amountPaid: paymentStatus === "paid" || isFree ? totalAmount : 0,
        applicantName: studentName,
        studentId,
        email,
        paymentType: "ticket_booking",
        paymentMethod: paymentMethod === "not_required" ? "other" : paymentMethod,
        status: paymentStatus === "paid" || isFree ? "completed" : "pending",
        paymentDate: new Date(),
        eventId,
        eventName: event.title,
        ticketType,
        quantity,
        notes:
          paymentDetails && typeof paymentDetails === "object"
            ? JSON.stringify(paymentDetails)
            : undefined,
        metadata: {
          description: `Ticket – ${event.title} (${ticketType} × ${quantity})`,
        },
      });

      await payment.save();
    }

    const ticket = new Ticket({
      eventId,
      eventTitle:      event.title,
      eventDate:       event.date,
      venue:           event.venue,
      studentName,
      studentId,
      email,
      phone,
      faculty,
      ticketType,
      quantity,
      unitPrice,
      totalAmount,
      paymentIntentId: paymentIntentId || undefined,
      paymentStatus,
      paymentMethod,
      paymentDetails,
      paymentId: payment?._id || undefined,
      status:          ticketStatus,
      bookedAt:        new Date(),
    });

    await ticket.save();

    if (payment) {
      payment.ticketId = ticket._id;
      await payment.save();
    }

    // Email feature removed per user request

    // Increment event's booked seat counter
    await Event.findByIdAndUpdate(eventId, {
      $inc: { bookedSeats: quantity },
    });

    res.status(201).json({
      message:      "🎉 Ticket booked successfully!",
      ticket,
      ticketNumber: ticket.ticketNumber,
      payment,
      receiptNumber: payment?.receiptNumber || null,
    });
  } catch (err) {
    console.error("❌ Book Ticket Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 🔍  Get Single Ticket by Ticket Number
// GET /api/tickets/:ticketNumber
// ─────────────────────────────────────────────
const getTicketByNumber = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      ticketNumber: req.params.ticketNumber,
    }).populate("eventId", "title date venue description organizer bannerImage");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (err) {
    console.error("❌ Get Ticket Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 📋  Get All Tickets Booked by a Student
// GET /api/tickets/student/:studentId
// ─────────────────────────────────────────────
const getTicketsByStudent = async (req, res) => {
  try {
    const tickets = await Ticket.find({ studentId: req.params.studentId })
      .sort({ bookedAt: -1 })
      .populate("eventId", "title date venue bannerImage status");

    res.json(tickets);
  } catch (err) {
    console.error("❌ Get Student Tickets Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 📋  Get All Tickets for an Event (Admin)
// GET /api/tickets/event/:eventId
// ─────────────────────────────────────────────
const getTicketsByEvent = async (req, res) => {
  try {
    const tickets = await Ticket.find({ eventId: req.params.eventId }).sort({ bookedAt: -1 });

    const summary = {
      total:        tickets.length,
      confirmed:    tickets.filter((t) => t.status === "confirmed").length,
      pending:      tickets.filter((t) => t.status === "pending").length,
      cancelled:    tickets.filter((t) => t.status === "cancelled").length,
      used:         tickets.filter((t) => t.status === "used").length,
      checkedIn:    tickets.filter((t) => t.checkedIn).length,
      totalRevenue: tickets
        .filter((t) => t.paymentStatus === "paid")
        .reduce((sum, t) => sum + t.totalAmount, 0),
    };

    res.json({ tickets, summary });
  } catch (err) {
    console.error("❌ Get Event Tickets Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// ❌  Cancel a Ticket
// PATCH /api/tickets/:ticketNumber/cancel
// ─────────────────────────────────────────────
const cancelTicket = async (req, res) => {
  try {
    const { reason } = req.body;
    const ticket = await Ticket.findOne({ ticketNumber: req.params.ticketNumber });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    if (ticket.status === "cancelled") {
      return res.status(400).json({ message: "Ticket is already cancelled" });
    }
    if (ticket.status === "used") {
      return res.status(400).json({ message: "Cannot cancel a ticket that has been used" });
    }
    if (ticket.eventDate && new Date(ticket.eventDate) < new Date()) {
      return res.status(400).json({ message: "Cannot cancel a ticket for a past event" });
    }

    ticket.status             = "cancelled";
    ticket.cancellationReason = reason || "Cancelled by student";
    ticket.cancelledAt        = new Date();
    await ticket.save();

    // Restore seat count on the event
    await Event.findByIdAndUpdate(ticket.eventId, {
      $inc: { bookedSeats: -ticket.quantity },
    });

    res.json({ message: "✅ Ticket cancelled successfully", ticket });
  } catch (err) {
    console.error("❌ Cancel Ticket Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// ✅  Check-in Ticket at Event Entrance
// PATCH /api/tickets/:ticketNumber/checkin
// ─────────────────────────────────────────────
const checkInTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketNumber: req.params.ticketNumber });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    if (ticket.status === "cancelled") {
      return res.status(400).json({ message: "Cannot check in a cancelled ticket" });
    }
    if (ticket.checkedIn) {
      return res.status(400).json({
        message:     "Ticket has already been checked in",
        checkedInAt: ticket.checkedInAt,
      });
    }
    if (ticket.paymentStatus === "failed") {
      return res.status(400).json({ message: "Cannot check in – payment failed" });
    }

    ticket.checkedIn    = true;
    ticket.checkedInAt  = new Date();
    ticket.status       = "used";
    await ticket.save();

    res.json({
      message:     "✅ Check-in successful!",
      ticketNumber: ticket.ticketNumber,
      studentName:  ticket.studentName,
      studentId:    ticket.studentId,
      eventTitle:   ticket.eventTitle,
      ticketType:   ticket.ticketType,
      quantity:     ticket.quantity,
    });
  } catch (err) {
    console.error("❌ Check-in Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 📊  Get Ticket Stats (Admin)
// GET /api/tickets/stats
// ─────────────────────────────────────────────
const getTicketStats = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const confirmed    = await Ticket.countDocuments({ status: "confirmed" });
    const pending      = await Ticket.countDocuments({ status: "pending" });
    const cancelled    = await Ticket.countDocuments({ status: "cancelled" });
    const used         = await Ticket.countDocuments({ status: "used" });

    res.json({ totalTickets, confirmed, pending, cancelled, used });
  } catch (err) {
    console.error("❌ Get Ticket Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 🔐 Verify Student Tickets by ID + Email (Secure)
// GET /api/tickets/verify/:studentId/:email
// ─────────────────────────────────────────────
const verifyStudentTicket = async (req, res) => {
  try {
    const { studentId, email } = req.params;
    
    if (!studentId || !email) {
      return res.status(400).json({ message: "Student ID and email required" });
    }

    const tickets = await Ticket.find({ 
      studentId: studentId.trim(), 
      email: email.trim().toLowerCase() 
    })
      .sort({ bookedAt: -1 })
      .populate("eventId", "title date venue bannerImage status");

    if (tickets.length === 0) {
      return res.json([]);
    }

    res.json(tickets);
  } catch (err) {
    console.error("❌ Verify Student Tickets Error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createTicketPaymentIntent,
  bookTicket,
  getTicketByNumber,
  getTicketsByStudent,
  getTicketsByEvent,
  cancelTicket,
  checkInTicket,
  getTicketStats,
  verifyStudentTicket,
};
