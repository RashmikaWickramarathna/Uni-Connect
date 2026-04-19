let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  } catch (error) {
    console.warn('Stripe SDK is unavailable. Install the "stripe" package to enable online payment intents.');
  }
}

const Ticket = require("../Model/Ticket");
const Event = require("../Model/Event");
const Payment = require("../Model/Payment");
const {
  buildDefaultTickets,
  getTicketLabel,
  humanizeTicketType,
  inferIsFreeEventFromTickets,
  normalizeTicketEntry,
} = require("../src/utils/ticketing");

const BOOKABLE_STATUSES = new Set(["approved", "published", "upcoming", "active"]);

const resolveEffectiveTicketPrice = (ticketConfig, isFreeEvent = false) =>
  isFreeEvent ? 0 : Math.max(0, Number(ticketConfig?.price) || 0);

const getEventTickets = (event) => {
  const inferredIsFreeEvent =
    typeof event?.isFreeEvent === "boolean"
      ? event.isFreeEvent
      : inferIsFreeEventFromTickets(event?.tickets, false);
  const fallbackSeats = Math.max(
    1,
    Number(event?.totalSeats) || Number(event?.maxParticipants) || 100
  );

  if (Array.isArray(event?.tickets) && event.tickets.length > 0) {
    return event.tickets.map((ticket, index) =>
      normalizeTicketEntry(ticket, fallbackSeats, {
        isFreeEvent: inferredIsFreeEvent,
        index,
      })
    );
  }

  return buildDefaultTickets(fallbackSeats, inferredIsFreeEvent);
};

const normalizePaymentMethod = (value, isFree) => {
  if (isFree) return "not_required";

  const normalized = String(value || "cash").trim().toLowerCase();
  return ["cash", "bank_transfer", "online"].includes(normalized) ? normalized : "cash";
};

const createTicketPaymentIntent = async (req, res) => {
  try {
    const {
      eventId,
      studentName,
      studentId,
      email,
      ticketType = "general",
      quantity = 1,
    } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!BOOKABLE_STATUSES.has(String(event.status).toLowerCase()) && !event.isPublished) {
      return res.status(400).json({ message: "This event is not available for booking" });
    }

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

    const ticketConfig = getEventTickets(event).find((ticket) => ticket.type === ticketType);
    if (!ticketConfig) {
      return res.status(400).json({
        message: `Ticket type "${ticketType}" not found for this event`,
      });
    }

    const ticketLabel = getTicketLabel(ticketConfig);
    const reservedSeats = await Ticket.countConfirmedForEvent(eventId, ticketType);
    const availableSeats = Math.max(Number(ticketConfig.totalSeats || 0) - reservedSeats, 0);

    if (availableSeats < quantity) {
      return res.status(400).json({
        message: `Only ${availableSeats} seat(s) remaining for "${ticketLabel}"`,
        availableSeats,
      });
    }

    const unitPrice = resolveEffectiveTicketPrice(ticketConfig, event.isFreeEvent);
    const totalAmount = unitPrice * quantity;

    if (totalAmount === 0) {
      return res.json({
        isFree: true,
        message: "This is a free event. Proceed to book directly.",
        totalAmount,
        unitPrice,
        quantity,
        ticketLabel,
        eventTitle: event.title,
        eventDate: event.date,
        venue: event.venue,
        availableSeats,
      });
    }

    if (!stripe) {
      return res.status(503).json({
        message: "Stripe is not configured. Online payment intents are unavailable in this environment.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "lkr",
      metadata: {
        event_id: eventId.toString(),
        event_name: event.title,
        student_id: studentId,
        student_name: studentName,
        email,
        ticket_type: ticketType,
        ticket_label: ticketLabel,
        quantity: quantity.toString(),
      },
      automatic_payment_methods: { enabled: true },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalAmount,
      unitPrice,
      quantity,
      ticketLabel,
      eventTitle: event.title,
      eventDate: event.date,
      venue: event.venue,
      availableSeats,
    });
  } catch (error) {
    console.error("Create Ticket Intent Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const bookTicket = async (req, res) => {
  try {
    const {
      eventId,
      studentName,
      studentId,
      email,
      phone,
      faculty,
      ticketType = "general",
      quantity = 1,
      paymentMethod: rawPaymentMethod,
      paymentDetails = null,
      paymentIntentId = null,
      stripeStatus = "succeeded",
    } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (paymentIntentId) {
      const duplicate = await Ticket.findOne({ paymentIntentId });
      if (duplicate) {
        return res.json({
          message: "Ticket already booked for this payment",
          ticket: duplicate,
        });
      }
    }

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

    const ticketConfig = getEventTickets(event).find((ticket) => ticket.type === ticketType);
    if (!ticketConfig) {
      return res.status(400).json({ message: `Ticket type "${ticketType}" not found` });
    }

    const ticketLabel = getTicketLabel(ticketConfig);
    const reservedSeats = await Ticket.countConfirmedForEvent(eventId, ticketType);
    if (Number(ticketConfig.totalSeats || 0) - reservedSeats < quantity) {
      return res.status(400).json({ message: `${ticketLabel} seats are no longer available` });
    }

    const unitPrice = resolveEffectiveTicketPrice(ticketConfig, event.isFreeEvent);
    const totalAmount = unitPrice * quantity;
    const isFree = totalAmount === 0;
    const paymentMethod = normalizePaymentMethod(rawPaymentMethod, isFree);

    let paymentStatus = "pending";
    if (isFree) {
      paymentStatus = "not_required";
    } else if (paymentMethod === "cash") {
      paymentStatus = "pending";
    } else if (stripeStatus === "succeeded" || ["bank_transfer", "online"].includes(paymentMethod)) {
      paymentStatus = "paid";
    }

    const ticketStatus =
      paymentStatus === "paid" || paymentStatus === "not_required" ? "confirmed" : "pending";

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
        ticketLabel,
        quantity,
        notes:
          paymentDetails && typeof paymentDetails === "object"
            ? JSON.stringify(paymentDetails)
            : undefined,
        metadata: {
          description: `Ticket – ${event.title} (${ticketLabel || humanizeTicketType(ticketType)} × ${quantity})`,
        },
      });

      await payment.save();
    }

    const ticket = new Ticket({
      eventId,
      eventTitle: event.title,
      eventDate: event.date,
      venue: event.venue,
      studentName,
      studentId,
      email,
      phone,
      faculty,
      ticketType,
      ticketLabel,
      quantity,
      unitPrice,
      totalAmount,
      paymentIntentId: paymentIntentId || undefined,
      paymentStatus,
      paymentMethod,
      paymentDetails,
      paymentId: payment?._id || undefined,
      status: ticketStatus,
      bookedAt: new Date(),
    });

    await ticket.save();

    if (payment) {
      payment.ticketId = ticket._id;
      await payment.save();
    }

    await Event.findByIdAndUpdate(eventId, {
      $inc: { bookedSeats: quantity },
    });

    return res.status(201).json({
      message: "Ticket booked successfully.",
      ticket,
      ticketNumber: ticket.ticketNumber,
      payment,
      receiptNumber: payment?.receiptNumber || null,
    });
  } catch (error) {
    console.error("Book Ticket Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getTicketByNumber = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      ticketNumber: req.params.ticketNumber,
    }).populate("eventId", "title date venue description organizer bannerImage");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.json(ticket);
  } catch (error) {
    console.error("Get Ticket Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getTicketsByStudent = async (req, res) => {
  try {
    const tickets = await Ticket.find({ studentId: req.params.studentId })
      .sort({ bookedAt: -1 })
      .populate("eventId", "title date venue bannerImage status");

    return res.json(tickets);
  } catch (error) {
    console.error("Get Student Tickets Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getTicketsByEvent = async (req, res) => {
  try {
    const tickets = await Ticket.find({ eventId: req.params.eventId }).sort({ bookedAt: -1 });

    const summary = {
      total: tickets.length,
      confirmed: tickets.filter((ticket) => ticket.status === "confirmed").length,
      pending: tickets.filter((ticket) => ticket.status === "pending").length,
      cancelled: tickets.filter((ticket) => ticket.status === "cancelled").length,
      used: tickets.filter((ticket) => ticket.status === "used").length,
      checkedIn: tickets.filter((ticket) => ticket.checkedIn).length,
      totalRevenue: tickets
        .filter((ticket) => ticket.paymentStatus === "paid")
        .reduce((sum, ticket) => sum + Number(ticket.totalAmount || 0), 0),
    };

    return res.json({ tickets, summary });
  } catch (error) {
    console.error("Get Event Tickets Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

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

    ticket.status = "cancelled";
    ticket.cancellationReason = reason || "Cancelled by student";
    ticket.cancelledAt = new Date();
    await ticket.save();

    await Event.findByIdAndUpdate(ticket.eventId, {
      $inc: { bookedSeats: -ticket.quantity },
    });

    return res.json({ message: "Ticket cancelled successfully", ticket });
  } catch (error) {
    console.error("Cancel Ticket Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

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
        message: "Ticket has already been checked in",
        checkedInAt: ticket.checkedInAt,
      });
    }
    if (ticket.paymentStatus === "failed") {
      return res.status(400).json({ message: "Cannot check in: payment failed" });
    }

    ticket.checkedIn = true;
    ticket.checkedInAt = new Date();
    ticket.status = "used";
    await ticket.save();

    return res.json({
      message: "Check-in successful.",
      ticketNumber: ticket.ticketNumber,
      studentName: ticket.studentName,
      studentId: ticket.studentId,
      eventTitle: ticket.eventTitle,
      ticketType: ticket.ticketType,
      ticketLabel: ticket.ticketLabel,
      quantity: ticket.quantity,
    });
  } catch (error) {
    console.error("Check-in Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getTicketStats = async (_req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const confirmed = await Ticket.countDocuments({ status: "confirmed" });
    const pending = await Ticket.countDocuments({ status: "pending" });
    const cancelled = await Ticket.countDocuments({ status: "cancelled" });
    const used = await Ticket.countDocuments({ status: "used" });

    return res.json({ totalTickets, confirmed, pending, cancelled, used });
  } catch (error) {
    console.error("Get Ticket Stats Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const verifyStudentTicket = async (req, res) => {
  try {
    const { studentId, email } = req.params;

    if (!studentId || !email) {
      return res.status(400).json({ message: "Student ID and email required" });
    }

    const tickets = await Ticket.find({
      studentId: studentId.trim(),
      email: email.trim().toLowerCase(),
    })
      .sort({ bookedAt: -1 })
      .populate("eventId", "title date venue bannerImage status");

    return res.json(tickets);
  } catch (error) {
    console.error("Verify Student Tickets Error:", error);
    return res.status(500).json({ error: error.message });
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
