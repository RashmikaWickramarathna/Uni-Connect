const fs = require("fs");
const SocietyRequest = require("../models/societyRequest");
const Society = require("../models/society");
const Event = require("../models/Event");
const {
  buildDefaultTickets,
  inferIsFreeEventFromTickets,
  normalizeTicketEntry,
  parseTicketsInput,
  validateUniqueTicketTypes,
} = require("../utils/ticketing");

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
  }
  return Boolean(value);
};

const formatDateInput = (value) => {
  if (!value) return null;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const cleanupUploadedFile = (file) => {
  if (file?.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

const verifyEventToken = async (req, res) => {
  try {
    const { token } = req.params;

    const society = await Society.findOne({ eventAccessToken: token, status: "Active" });
    if (society) {
      return res.json({
        valid: true,
        type: "society",
        societyId: society._id,
        societyName: society.societyName,
        officialEmail: society.officialEmail,
      });
    }

    const request = await SocietyRequest.findOne({ eventAccessToken: token, status: "Approved" });
    if (request) {
      if (request.eventAccessExpiresAt && request.eventAccessExpiresAt < new Date()) {
        return res.status(400).json({ valid: false, message: "Token expired" });
      }

      return res.json({
        valid: true,
        type: "request",
        societyRequestId: request._id,
        societyName: request.societyName,
        officialEmail: request.officialEmail,
      });
    }

    return res.status(404).json({
      valid: false,
      message: "Invalid token",
    });
  } catch (error) {
    console.error("VERIFY EVENT TOKEN ERROR:", error);
    return res.status(500).json({
      message: "Failed to verify token",
      error: error.message,
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const { token } = req.params;
    const eventData = req.body;
    const date = formatDateInput(eventData.date || eventData.eventDate);

    if (!eventData.title || !eventData.description || !date || !eventData.venue) {
      cleanupUploadedFile(req.file);
      return res.status(400).json({ message: "Missing required event fields" });
    }

    const society = await Society.findOne({ eventAccessToken: token, status: "Active" });
    let societyId = null;
    let societyRequestId = null;
    let organizer = eventData.organizer;
    let organizerEmail = eventData.organizerEmail;

    if (society) {
      societyId = society._id;
      organizer = organizer || society.societyName;
      organizerEmail = organizerEmail || society.officialEmail;
    } else {
      const request = await SocietyRequest.findOne({ eventAccessToken: token, status: "Approved" });
      if (!request) {
        cleanupUploadedFile(req.file);
        return res.status(404).json({ message: "Invalid token" });
      }

      if (request.eventAccessExpiresAt && request.eventAccessExpiresAt < new Date()) {
        cleanupUploadedFile(req.file);
        return res.status(400).json({ message: "Event access token expired" });
      }

      societyRequestId = request._id;
      organizer = organizer || request.societyName;
      organizerEmail = organizerEmail || request.officialEmail;
    }

    const parsedMaxParticipants = Number(eventData.maxParticipants ?? eventData.maxAttendees);
    const safeMaxParticipants =
      Number.isFinite(parsedMaxParticipants) && parsedMaxParticipants > 0
        ? parsedMaxParticipants
        : 100;
    const hasExplicitFreeFlag = Object.prototype.hasOwnProperty.call(eventData, "isFreeEvent");
    const parsedTickets = parseTicketsInput(eventData.tickets, safeMaxParticipants);
    const isFreeEvent = hasExplicitFreeFlag
      ? toBoolean(eventData.isFreeEvent)
      : inferIsFreeEventFromTickets(parsedTickets, false);
    const tickets =
      parsedTickets.length > 0
        ? parsedTickets.map((ticket, index) =>
            normalizeTicketEntry(ticket, safeMaxParticipants, {
              isFreeEvent,
              index,
            })
          )
        : buildDefaultTickets(safeMaxParticipants, isFreeEvent);

    if (!validateUniqueTicketTypes(tickets)) {
      cleanupUploadedFile(req.file);
      return res.status(400).json({ message: "Each ticket option must use a unique ticket type." });
    }

    const invalidTicketLabel = tickets.find((ticket) => String(ticket?.label || "").trim().length < 2);
    if (invalidTicketLabel) {
      cleanupUploadedFile(req.file);
      return res.status(400).json({ message: "Every ticket option must include a label." });
    }
    const tags = Array.isArray(eventData.tags)
      ? eventData.tags
      : typeof eventData.tags === "string"
        ? eventData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

    const event = new Event({
      title: eventData.title,
      description: eventData.description,
      date,
      time: eventData.time || null,
      venue: eventData.venue,
      category: eventData.category || "Other",
      organizer,
      organizerEmail,
      maxParticipants: safeMaxParticipants,
      tickets,
      isFreeEvent,
      totalSeats: tickets.reduce((sum, ticket) => sum + Number(ticket.totalSeats || 0), 0),
      status: eventData.status || "pending",
      image: req.file ? req.file.filename : null,
      tags,
      societyId,
      societyRequestId,
    });

    await event.save();

    res.status(201).json({
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    cleanupUploadedFile(req.file);
    console.error("CREATE EVENT ERROR:", error);
    res.status(500).json({
      message: "Failed to create event",
      error: error.message,
    });
  }
};

module.exports = {
  verifyEventToken,
  createEvent,
};
