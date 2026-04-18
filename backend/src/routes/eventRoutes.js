const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyEventToken, createEvent } = require("../controllers/eventController");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const Reminder = require("../models/Reminder");
const Society = require("../models/society");
const SocietyRequest = require("../models/societyRequest");

const router = express.Router();
const PUBLIC_STATUSES = new Set(["approved", "published", "upcoming", "active"]);
const DEFAULT_GENERAL_TICKET_PRICE = Math.max(
  1,
  Number(process.env.DEFAULT_GENERAL_TICKET_PRICE) || 500
);

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});

const fileFilter = (_req, file, cb) =>
  ["image/jpeg", "image/png"].includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only JPG/PNG"), false);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const deleteUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeText = (value) => String(value || "").trim().replace(/\s+/g, " ");

const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toDateString = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeStatus = (status) => {
  const normalizedStatus = String(status || "pending").trim().toLowerCase();
  if (normalizedStatus === "published") return "approved";
  if (normalizedStatus === "draft") return "pending";
  return normalizedStatus;
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
  }
  return Boolean(value);
};

const hasOwn = (value, key) =>
  Boolean(value && Object.prototype.hasOwnProperty.call(value, key));

const isLegacyGeneralFallbackTicket = (ticket, type, rawPrice) => {
  const description = String(ticket?.description || "").trim().toLowerCase();
  return (
    type === "general" &&
    rawPrice === 0 &&
    (!description || description === "general admission")
  );
};

const inferIsFreeEventFromTickets = (tickets, fallback = false) => {
  if (!Array.isArray(tickets) || tickets.length === 0) {
    return fallback;
  }

  return tickets.every((ticket) => Math.max(0, Number(ticket?.price) || 0) === 0);
};

const buildDefaultTickets = (seatCount = 100, isFreeEvent = false) => [
  {
    type: "general",
    price: isFreeEvent ? 0 : DEFAULT_GENERAL_TICKET_PRICE,
    totalSeats: seatCount,
    description: isFreeEvent ? "Free admission" : "General admission",
  },
];

const normalizeTicketEntry = (
  ticket,
  fallbackSeats = 100,
  { isFreeEvent = false, allowLegacyPaidFallback = false } = {}
) => {
  const type = String(ticket?.type || "general").trim().toLowerCase() || "general";
  const rawPrice = Number(ticket?.price);
  const totalSeats = Number(ticket?.totalSeats);
  return {
    type,
    price: isFreeEvent
      ? 0
      : allowLegacyPaidFallback && isLegacyGeneralFallbackTicket(ticket, type, rawPrice)
        ? DEFAULT_GENERAL_TICKET_PRICE
        : Math.max(0, Number.isFinite(rawPrice) ? rawPrice : 0),
    totalSeats:
      Number.isFinite(totalSeats) && totalSeats > 0 ? totalSeats : Math.max(1, fallbackSeats),
    description: String(ticket?.description || "").trim(),
  };
};

const parseTicketsInput = (tickets, fallbackSeats = 100, options = {}) => {
  if (!tickets) return [];

  let parsedTickets = tickets;
  if (typeof tickets === "string") {
    try {
      parsedTickets = JSON.parse(tickets);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsedTickets)) return [];
  return parsedTickets.map((ticket) => normalizeTicketEntry(ticket, fallbackSeats, options));
};

const isPopulatedDoc = (value) =>
  Boolean(value && typeof value === "object" && !Array.isArray(value) && value._id);

const normalizeEventRecord = (event) => {
  const linkedSociety = isPopulatedDoc(event?.societyId) ? event.societyId : null;
  const linkedRequest = isPopulatedDoc(event?.societyRequestId) ? event.societyRequestId : null;
  const organizer =
    String(
      event?.organizer ||
        linkedSociety?.societyName ||
        linkedRequest?.societyName ||
        "Unknown Society"
    ).trim() || "Unknown Society";
  const organizerEmail = String(
    event?.organizerEmail || linkedSociety?.officialEmail || linkedRequest?.officialEmail || ""
  )
    .trim()
    .toLowerCase();
  const maxParticipants = Number(event?.maxParticipants ?? event?.maxAttendees);
  const fallbackSeats =
    Number.isFinite(maxParticipants) && maxParticipants > 0 ? maxParticipants : 100;
  const hasExplicitFreeFlag = typeof event?.isFreeEvent === "boolean";
  const inferredIsFreeEvent = hasExplicitFreeFlag
    ? event.isFreeEvent
    : inferIsFreeEventFromTickets(event?.tickets, false);
  const tickets =
    Array.isArray(event?.tickets) && event.tickets.length > 0
      ? event.tickets.map((ticket) =>
          normalizeTicketEntry(ticket, fallbackSeats, {
            isFreeEvent: inferredIsFreeEvent,
            allowLegacyPaidFallback: !inferredIsFreeEvent && !hasExplicitFreeFlag,
          })
        )
      : buildDefaultTickets(fallbackSeats, inferredIsFreeEvent);
  const totalSeats =
    tickets.reduce((sum, ticket) => sum + Number(ticket.totalSeats || 0), 0) ||
    fallbackSeats;
  const bookedSeats = Math.max(
    0,
    Math.min(Number(event?.bookedSeats || 0), Number.isFinite(totalSeats) ? totalSeats : 0)
  );
  const status = normalizeStatus(event?.status || (event?.isPublished ? "approved" : "pending"));
  const image = event?.image || event?.bannerImage || null;

  return {
    ...event,
    societyId: linkedSociety?._id || event?.societyId || null,
    societyRequestId: linkedRequest?._id || event?.societyRequestId || null,
    title: String(event?.title || "Untitled Event").trim() || "Untitled Event",
    description: String(event?.description || "").trim(),
    shortDescription:
      String(event?.shortDescription || event?.description || "")
        .trim()
        .slice(0, 160) || "",
    date: toDateString(event?.date || event?.eventDate),
    time: String(event?.time || "").trim(),
    venue: String(event?.venue || "TBA").trim() || "TBA",
    category: String(event?.category || "Other").trim() || "Other",
    organizer,
    organizerEmail,
    maxParticipants: fallbackSeats,
    tickets,
    totalSeats,
    bookedSeats,
    availableSeats: Math.max(totalSeats - bookedSeats, 0),
    isFreeEvent: inferredIsFreeEvent,
    status,
    image,
    bannerImage: image,
    isFeatured: Boolean(event?.isFeatured),
    isPublished: Boolean(event?.isPublished || PUBLIC_STATUSES.has(status)),
    tags: Array.isArray(event?.tags) ? event.tags.filter(Boolean) : [],
    views: Number.isFinite(Number(event?.views)) ? Number(event.views) : 0,
    adminReason: event?.adminReason || null,
    adminActionAt: event?.adminActionAt || null,
    reminderSent7Days: Boolean(event?.reminderSent7Days),
    reminderSent1Day: Boolean(event?.reminderSent1Day),
    createdAt: event?.createdAt || null,
    updatedAt: event?.updatedAt || null,
  };
};

const isPublicEvent = (event) => {
  const normalized = normalizeEventRecord(event);
  return normalized.isPublished || PUBLIC_STATUSES.has(normalized.status);
};

const isUpcomingEvent = (event) => {
  const normalizedDate = toDateString(event?.date);
  if (!normalizedDate) return false;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
  return normalizedDate >= todayStr;
};

const getNormalizedEventById = async (id) => {
  const event = await Event.findById(id)
    .populate("societyId", "societyName officialEmail")
    .populate("societyRequestId", "societyName officialEmail")
    .lean();

  return event ? normalizeEventRecord(event) : null;
};

const buildSocietyEventQuery = async (email, organizerName) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedOrganizer = String(organizerName || "").trim();
  const queryParts = [];

  if (normalizedEmail) {
    queryParts.push({ organizerEmail: normalizedEmail });

    const [society, request] = await Promise.all([
      Society.findOne({ officialEmail: normalizedEmail }).select("_id").lean(),
      SocietyRequest.findOne({ officialEmail: normalizedEmail }).select("_id").lean(),
    ]);

    if (society?._id) queryParts.push({ societyId: society._id });
    if (request?._id) queryParts.push({ societyRequestId: request._id });
  }

  if (normalizedOrganizer) {
    queryParts.push({ organizer: normalizedOrganizer });
  }

  return queryParts.length > 0 ? { $or: queryParts } : { _id: null };
};

const normalizeEventPayload = (data, image = null) => {
  const maxParticipants = Number(data.maxParticipants);
  const safeMaxParticipants =
    Number.isFinite(maxParticipants) && maxParticipants > 0 ? maxParticipants : 100;
  const hasExplicitFreeFlag = hasOwn(data, "isFreeEvent");
  const parsedTickets = parseTicketsInput(data.tickets, safeMaxParticipants);
  const isFreeEvent = hasExplicitFreeFlag
    ? toBoolean(data.isFreeEvent)
    : inferIsFreeEventFromTickets(parsedTickets, false);
  const normalizedTickets =
    parsedTickets.length > 0
      ? parsedTickets.map((ticket) =>
          normalizeTicketEntry(ticket, safeMaxParticipants, {
            isFreeEvent,
            allowLegacyPaidFallback: !isFreeEvent && !hasExplicitFreeFlag,
          })
        )
      : buildDefaultTickets(safeMaxParticipants, isFreeEvent);
  const totalSeats = normalizedTickets.reduce(
    (sum, ticket) => sum + Number(ticket.totalSeats || 0),
    0
  );
  const status = normalizeStatus(data.status);

  return {
    title: normalizeText(data.title),
    description: String(data.description || "").trim(),
    shortDescription: normalizeText(data.shortDescription) || String(data.description || "").trim().slice(0, 160),
    date: data.date,
    time: String(data.time || "").trim() || null,
    venue: normalizeText(data.venue),
    category: normalizeText(data.category) || "Other",
    organizer: normalizeText(data.organizer),
    organizerEmail: data.organizerEmail?.trim()?.toLowerCase(),
    maxParticipants: safeMaxParticipants,
    tickets: normalizedTickets,
    totalSeats,
    isFreeEvent,
    isFeatured: toBoolean(data.isFeatured),
    isPublished: toBoolean(data.isPublished) || PUBLIC_STATUSES.has(status),
    status,
    tags: normalizeTags(data.tags),
    ...(image ? { image, bannerImage: image } : {}),
  };
};

const validate = async (data, excludeId = null) => {
  const errors = [];
  const {
    title,
    description,
    date,
    time,
    venue,
    organizer,
    organizerEmail,
    maxParticipants,
    tickets,
    tags,
  } = data;
  const normalizedTitle = normalizeText(title);
  const normalizedVenue = normalizeText(venue);
  const normalizedDescription = String(description || "").trim();
  const normalizedTime = String(time || "").trim();
  const parsedMaxParticipants = Number(maxParticipants);
  const normalizedTags = normalizeTags(tags);

  if (!normalizedTitle || normalizedTitle.length < 5) errors.push("Title must be at least 5 characters.");
  if (normalizedTitle.length > 100) errors.push("Title cannot exceed 100 characters.");
  if (!normalizedDescription || normalizedDescription.length < 20) {
    errors.push("Description must be at least 20 characters.");
  }
  if (normalizedDescription.length > 1000) {
    errors.push("Description cannot exceed 1000 characters.");
  }
  if (!organizer || !organizer.trim()) errors.push("Organizer is required.");
  if (!organizerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail)) {
    errors.push("Valid email with @ is required.");
  }
  if (!normalizedTime) errors.push("Event time is required.");
  else if (!/^\d{2}:\d{2}$/.test(normalizedTime)) errors.push("Event time must be in HH:MM format.");
  if (!normalizedVenue) errors.push("Venue is required.");
  else if (normalizedVenue.length < 3) errors.push("Venue must be at least 3 characters.");
  else if (normalizedVenue.length > 120) errors.push("Venue cannot exceed 120 characters.");

  if (
    !Number.isInteger(parsedMaxParticipants) ||
    parsedMaxParticipants < 1 ||
    parsedMaxParticipants > 10000
  ) {
    errors.push("Max participants must be between 1 and 10000.");
  }

  if (!Array.isArray(tickets) || tickets.length === 0) {
    errors.push("At least one ticket option is required.");
  } else {
    const totalSeats = tickets.reduce((sum, ticket) => sum + Number(ticket?.totalSeats || 0), 0);

    tickets.forEach((ticket) => {
      const totalTicketSeats = Number(ticket?.totalSeats);
      const ticketPrice = Number(ticket?.price);
      const ticketNote = normalizeText(ticket?.description);

      if (!Number.isInteger(totalTicketSeats) || totalTicketSeats < 1 || totalTicketSeats > 10000) {
        errors.push("Each ticket type must have between 1 and 10000 seats.");
      }
      if (!Number.isFinite(ticketPrice) || ticketPrice < 0) {
        errors.push("Ticket price must be 0 or more.");
      }
      if (ticketNote.length > 120) {
        errors.push("Ticket note cannot exceed 120 characters.");
      }
    });

    if (Number.isInteger(parsedMaxParticipants) && totalSeats > parsedMaxParticipants) {
      errors.push("Total ticket seats cannot exceed max participants.");
    }
  }

  if (normalizedTags.length > 8) {
    errors.push("Only 8 tags are allowed.");
  } else {
    const invalidTag = normalizedTags.find((tag) => tag.length > 24);
    const duplicateTags = normalizedTags.filter(
      (tag, index) =>
        normalizedTags.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) !== index
    );

    if (invalidTag) {
      errors.push("Each tag must be 24 characters or fewer.");
    }
    if (duplicateTags.length > 0) {
      errors.push(`Duplicate tags are not allowed: ${[...new Set(duplicateTags)].join(", ")}.`);
    }
  }

  if (!date) {
    errors.push("Event date is required.");
  } else {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    if (date <= todayStr) errors.push("Date must be at least one day in the future.");
  }

  if (date && normalizedVenue) {
    const venueQuery = { date, venue: new RegExp(`^${escapeRegex(normalizedVenue)}$`, "i") };
    if (excludeId) venueQuery._id = { $ne: excludeId };
    const existingVenue = await Event.findOne(venueQuery);
    if (existingVenue) {
      errors.push(
        `"${existingVenue.title}" already uses "${existingVenue.venue}" on ${date}. Choose a different venue or date.`
      );
    }
  }

  if (organizerEmail && date && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail)) {
    const organizerQuery = { organizerEmail: organizerEmail.toLowerCase(), date };
    if (excludeId) organizerQuery._id = { $ne: excludeId };
    const count = await Event.countDocuments(organizerQuery);
    if (count >= 10) errors.push("Society limit of 10 events per day reached.");

    if (normalizedTime) {
      const sameTimeQuery = { organizerEmail: organizerEmail.toLowerCase(), date, time: normalizedTime };
      if (excludeId) sameTimeQuery._id = { $ne: excludeId };
      const existingTime = await Event.findOne(sameTimeQuery);
      if (existingTime) {
        errors.push(
          `"${existingTime.title}" is already scheduled at ${normalizedTime} on ${date} for your society.`
        );
      }
    }

    if (normalizedTitle) {
      const titleQuery = {
        organizerEmail: organizerEmail.toLowerCase(),
        date,
        title: new RegExp(`^${escapeRegex(normalizedTitle)}$`, "i"),
      };
      if (excludeId) titleQuery._id = { $ne: excludeId };
      const existingTitle = await Event.findOne(titleQuery);
      if (existingTitle) {
        errors.push(
          `"${existingTitle.title}" is already scheduled on ${date} for your society. Update the existing event instead.`
        );
      }
    }
  }

  return errors;
};

router.get("/verify-event-token/:token", verifyEventToken);
router.post("/:token", upload.single("image"), createEvent);

router.get("/public", async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    const normalizedSearch = String(search || "").trim().toLowerCase();
    const normalizedCategory = String(category || "").trim().toLowerCase();

    const events = (await Event.find().sort({ date: 1 }).lean())
      .map(normalizeEventRecord)
      .filter((event) => isPublicEvent(event) && isUpcomingEvent(event))
      .filter((event) =>
        normalizedCategory ? String(event.category).trim().toLowerCase() === normalizedCategory : true
      )
      .filter((event) => (featured ? event.isFeatured : true))
      .filter((event) => {
        if (!normalizedSearch) return true;
        return [event.title, event.venue, event.organizer, event.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      });

    res.json(events);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

router.get("/public/:id", async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    const event = await getNormalizedEventById(req.params.id);

    if (!event || !isPublicEvent(event)) {
      return res.status(404).json({ errors: ["Not found"] });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

router.get("/", async (req, res) => {
  try {
    const { email, organizer, role } = req.query;
    const query = role === "society" ? await buildSocietyEventQuery(email, organizer) : {};
    const events = await Event.find(query)
      .populate("societyId", "societyName officialEmail")
      .populate("societyRequestId", "societyName officialEmail")
      .sort({ createdAt: -1 })
      .lean();

    res.json(events.map(normalizeEventRecord));
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

router.get("/analytics", async (_req, res) => {
  try {
    const all = (await Event.find().lean()).map(normalizeEventRecord);
    const total = all.length;
    const approved = all.filter((event) => event.status === "approved").length;
    const rejected = all.filter((event) => event.status === "rejected").length;
    const pending = all.filter((event) => event.status === "pending").length;

    const byCategory = {};
    all.forEach((event) => {
      byCategory[event.category] = (byCategory[event.category] || 0) + 1;
    });

    const byMonth = {};
    const now = new Date();
    for (let offset = 5; offset >= 0; offset -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = 0;
    }

    all.forEach((event) => {
      if (event.date) {
        const key = event.date.substring(0, 7);
        if (Object.prototype.hasOwnProperty.call(byMonth, key)) {
          byMonth[key] += 1;
        }
      }
    });

    const societyMap = {};
    all.forEach((event) => {
      const key = event.organizerEmail || "unknown";
      if (!societyMap[key]) {
        societyMap[key] = {
          email: key,
          name: event.organizer,
          count: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
        };
      }

      societyMap[key].count += 1;
      if (event.status === "approved") societyMap[key].approved += 1;
      if (event.status === "rejected") societyMap[key].rejected += 1;
      if (event.status === "pending") societyMap[key].pending += 1;
    });

    const topSocieties = Object.values(societyMap)
      .sort((left, right) => right.count - left.count)
      .slice(0, 5);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in30Str = `${in30Days.getFullYear()}-${String(in30Days.getMonth() + 1).padStart(2, "0")}-${String(
      in30Days.getDate()
    ).padStart(2, "0")}`;
    const upcoming = all.filter(
      (event) => event.status === "approved" && event.date > todayStr && event.date <= in30Str
    ).length;

    const categoryTrend = {};
    all.forEach((event) => {
      const month = event.date ? event.date.substring(0, 7) : null;
      if (month && Object.prototype.hasOwnProperty.call(byMonth, month)) {
        categoryTrend[event.category] = (categoryTrend[event.category] || 0) + 1;
      }
    });

    res.json({
      total,
      approved,
      rejected,
      pending,
      byCategory,
      byMonth,
      topSocieties,
      upcoming,
      categoryTrend,
    });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

router.get("/reminders", async (_req, res) => {
  try {
    const reminders = await Reminder.find().sort({ sentAt: -1 }).limit(50);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

router.get("/notifications/:email", async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientEmail: req.params.email.toLowerCase(),
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

router.patch("/notifications/read-all/:email", async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientEmail: req.params.email.toLowerCase() },
      { isRead: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

router.get("/:id", async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    const event = await getNormalizedEventById(req.params.id);
    if (!event) return res.status(404).json({ errors: ["Not found"] });
    res.json(event);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const data = normalizeEventPayload(req.body, req.file?.filename || null);
    const errors = await validate(data);

    if (errors.length > 0) {
      deleteUploadedFile(req.file?.path);
      return res.status(400).json({ errors });
    }

    const event = new Event(data);
    const saved = await event.save();
    res.status(201).json(normalizeEventRecord(saved.toObject()));
  } catch (err) {
    deleteUploadedFile(req.file?.path);
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ errors: Object.values(err.errors).map((error) => error.message) });
    }
    res.status(500).json({ errors: [err.message] });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const data = normalizeEventPayload(req.body, req.file?.filename || null);
    const errors = await validate(data, req.params.id);

    if (errors.length > 0) {
      deleteUploadedFile(req.file?.path);
      return res.status(400).json({ errors });
    }

    if (req.file) {
      const oldEvent = await Event.findById(req.params.id);
      if (oldEvent?.image) {
        deleteUploadedFile(path.join(uploadsDir, oldEvent.image));
      }
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ errors: ["Not found"] });
    res.json(normalizeEventRecord(updated.toObject()));
  } catch (err) {
    deleteUploadedFile(req.file?.path);
    res.status(500).json({ errors: [err.message] });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const status = normalizeStatus(req.body.status);
    const { adminReason } = req.body;
    if (status === "rejected" && !adminReason) {
      return res.status(400).json({ errors: ["Reason required for rejection."] });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status,
        isPublished: PUBLIC_STATUSES.has(status),
        adminReason: adminReason || null,
        adminActionAt: new Date(),
      },
      { new: true }
    );

    if (!event) return res.status(404).json({ errors: ["Not found"] });

    const normalizedEvent = await getNormalizedEventById(event._id);
    if (!normalizedEvent) return res.status(404).json({ errors: ["Not found"] });

    const message =
      status === "approved"
        ? `Your event "${normalizedEvent.title}" has been approved! It is now confirmed for ${normalizedEvent.date}.`
        : `Your event "${normalizedEvent.title}" was rejected. Reason: ${adminReason}`;

    if (normalizedEvent.organizerEmail) {
      await Notification.create({
        recipientEmail: normalizedEvent.organizerEmail,
        eventId: normalizedEvent._id,
        eventTitle: normalizedEvent.title,
        type: status,
        message,
      });
    }

    res.json(normalizedEvent);
  } catch (err) {
    res.status(400).json({ errors: [err.message] });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { adminReason, deletedBy } = req.body;
    if (deletedBy === "admin" && !adminReason) {
      return res.status(400).json({ errors: ["Reason required."] });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ errors: ["Not found"] });

    if (event.image) {
      deleteUploadedFile(path.join(uploadsDir, event.image));
    }

    if (deletedBy === "admin" && adminReason && event.organizerEmail) {
      await Notification.create({
        recipientEmail: event.organizerEmail,
        eventId: event._id,
        eventTitle: event.title,
        type: "deleted",
        message: `Your event "${event.title}" was deleted by admin. Reason: ${adminReason}`,
      });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ errors: ["Image must be 2MB or less."] });
  }
  if (err) return res.status(400).json({ errors: [err.message] });
  next();
});

module.exports = router;
