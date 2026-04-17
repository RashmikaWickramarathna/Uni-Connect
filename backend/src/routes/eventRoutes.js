const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyEventToken, createEvent } = require("../controllers/eventController");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const Reminder = require("../models/Reminder");

const router = express.Router();

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
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
};

const normalizeEventPayload = (data, image = null) => {
  const maxParticipants = Number(data.maxParticipants);

  return {
    title: data.title?.trim(),
    description: data.description?.trim(),
    date: data.date,
    time: data.time || null,
    venue: data.venue?.trim(),
    category: data.category || "Other",
    organizer: data.organizer?.trim(),
    organizerEmail: data.organizerEmail?.trim()?.toLowerCase(),
    maxParticipants:
      Number.isFinite(maxParticipants) && maxParticipants > 0 ? maxParticipants : 100,
    tags: normalizeTags(data.tags),
    ...(image ? { image } : {}),
  };
};

const validate = async (data, excludeId = null) => {
  const errors = [];
  const { title, description, date, time, venue, organizer, organizerEmail } = data;

  if (!title || title.trim().length < 5) errors.push("Title must be at least 5 characters.");
  if (title && title.trim().length > 100) errors.push("Title cannot exceed 100 characters.");
  if (!description || description.trim().length < 20) {
    errors.push("Description must be at least 20 characters.");
  }
  if (description && description.trim().length > 1000) {
    errors.push("Description cannot exceed 1000 characters.");
  }
  if (!organizer || !organizer.trim()) errors.push("Organizer is required.");
  if (!organizerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail)) {
    errors.push("Valid email with @ is required.");
  }
  if (!time) errors.push("Event time is required.");
  if (!venue || !venue.trim()) errors.push("Venue is required.");

  if (!date) {
    errors.push("Event date is required.");
  } else {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (date <= todayStr) errors.push("Date must be at least one day in the future.");
  }

  if (date) {
    const dateQuery = { date };
    if (excludeId) dateQuery._id = { $ne: excludeId };
    const existingDate = await Event.findOne(dateQuery);
    if (existingDate) {
      errors.push(`"${existingDate.title}" already scheduled on ${date}. Choose a different date.`);
    }
  }

  if (date && venue) {
    const venueQuery = { date, venue: venue.trim() };
    if (excludeId) venueQuery._id = { $ne: excludeId };
    const existingVenue = await Event.findOne(venueQuery);
    if (existingVenue) {
      errors.push(
        `"${existingVenue.title}" already using "${venue}" on ${date}. Choose a different venue or date.`
      );
    }
  }

  if (organizerEmail && date && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail)) {
    const organizerQuery = { organizerEmail: organizerEmail.toLowerCase(), date };
    if (excludeId) organizerQuery._id = { $ne: excludeId };
    const count = await Event.countDocuments(organizerQuery);
    if (count >= 10) errors.push("Society limit of 10 events per day reached.");
  }

  return errors;
};

router.get("/verify-event-token/:token", verifyEventToken);
router.post("/:token", upload.single("image"), createEvent);

router.get("/", async (req, res) => {
  try {
    const { email, role } = req.query;
    const query = role === "society" && email ? { organizerEmail: email.toLowerCase() } : {};
    const events = await Event.find(query).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

router.get("/analytics", async (_req, res) => {
  try {
    const all = await Event.find();
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
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in30Str = `${in30Days.getFullYear()}-${String(in30Days.getMonth() + 1).padStart(2, "0")}-${String(in30Days.getDate()).padStart(2, "0")}`;
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
    const event = await Event.findById(req.params.id);
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
    res.status(201).json(saved);
  } catch (err) {
    deleteUploadedFile(req.file?.path);
    if (err.name === "ValidationError") {
      return res.status(400).json({ errors: Object.values(err.errors).map((error) => error.message) });
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
    res.json(updated);
  } catch (err) {
    deleteUploadedFile(req.file?.path);
    res.status(500).json({ errors: [err.message] });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { status, adminReason } = req.body;
    if (status === "rejected" && !adminReason) {
      return res.status(400).json({ errors: ["Reason required for rejection."] });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status, adminReason: adminReason || null, adminActionAt: new Date() },
      { new: true }
    );

    if (!event) return res.status(404).json({ errors: ["Not found"] });

    const message =
      status === "approved"
        ? `Your event "${event.title}" has been approved! It is now confirmed for ${event.date}.`
        : `Your event "${event.title}" was rejected. Reason: ${adminReason}`;

    await Notification.create({
      recipientEmail: event.organizerEmail,
      eventId: event._id,
      eventTitle: event.title,
      type: status,
      message,
    });

    res.json(event);
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

    if (deletedBy === "admin" && adminReason) {
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
