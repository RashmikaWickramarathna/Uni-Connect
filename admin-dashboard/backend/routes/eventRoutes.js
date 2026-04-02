const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Event = require("../models/Event");
const Reminder = require("../models/Reminder");

// ── MULTER SETUP ─────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-")),
});
const fileFilter = (req, file, cb) => {
  ["image/jpeg", "image/png"].includes(file.mimetype) ? cb(null, true) : cb(new Error("Only JPG and PNG allowed"), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

// ── VALIDATION ────────────────────────────────────────────────────────────────
const validateEventData = async (data, excludeId = null) => {
  const errors = [];
  const { title, description, date, organizerEmail } = data;
  if (title) {
    if (title.trim().length < 5) errors.push("Title must be at least 5 characters.");
    if (title.trim().length > 100) errors.push("Title cannot exceed 100 characters.");
  }
  if (description) {
    if (description.trim().length < 20) errors.push("Description must be at least 20 characters.");
    if (description.trim().length > 1000) errors.push("Description cannot exceed 1000 characters.");
  }
  if (organizerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail)) {
    errors.push("Please enter a valid email address.");
  }
  if (date) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    if (date <= todayStr) errors.push("Event date must be at least one day in the future.");
    const query = { date };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Event.findOne(query);
    if (existing) errors.push(`"${existing.title}" is already scheduled on ${date}.`);
  }
  if (organizerEmail && date && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail)) {
    const query = { organizerEmail: organizerEmail.toLowerCase(), date };
    if (excludeId) query._id = { $ne: excludeId };
    const count = await Event.countDocuments(query);
    if (count >= 10) errors.push("This society has reached the limit of 10 events on this date.");
  }
  return errors;
};

// ── GET ALL EVENTS ────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// ── GET ANALYTICS ─────────────────────────────────────────────────────────────
router.get("/analytics", async (req, res) => {
  try {
    const all = await Event.find();
    const total = all.length;
    const approved = all.filter(e => e.status === "approved").length;
    const rejected = all.filter(e => e.status === "rejected").length;
    const pending = all.filter(e => e.status === "pending").length;

    // Events by category
    const byCategory = {};
    all.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + 1; });

    // Events by month (last 6 months)
    const byMonth = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      byMonth[key] = 0;
    }
    all.forEach(e => {
      if (e.date) {
        const key = e.date.substring(0, 7);
        if (byMonth.hasOwnProperty(key)) byMonth[key]++;
      }
    });

    // Top societies by event count
    const societyMap = {};
    all.forEach(e => {
      const key = e.organizerEmail || "unknown";
      if (!societyMap[key]) societyMap[key] = { email: key, name: e.organizer, count: 0, approved: 0, rejected: 0 };
      societyMap[key].count++;
      if (e.status === "approved") societyMap[key].approved++;
      if (e.status === "rejected") societyMap[key].rejected++;
    });
    const topSocieties = Object.values(societyMap).sort((a, b) => b.count - a.count).slice(0, 5);

    // Upcoming approved events in next 30 days
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const in30 = new Date(today.getTime() + 30*24*60*60*1000);
    const in30Str = `${in30.getFullYear()}-${String(in30.getMonth()+1).padStart(2,"0")}-${String(in30.getDate()).padStart(2,"0")}`;
    const upcoming = all.filter(e => e.status === "approved" && e.date > todayStr && e.date <= in30Str).length;

    res.json({ total, approved, rejected, pending, byCategory, byMonth, topSocieties, upcoming });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// ── GET REMINDERS HISTORY ─────────────────────────────────────────────────────
router.get("/reminders", async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ sentAt: -1 }).limit(50);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// ── GET SINGLE EVENT ──────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ errors: ["Event not found"] });
    res.json(event);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// ── POST CREATE EVENT ─────────────────────────────────────────────────────────
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const errors = await validateEventData(req.body);
    if (errors.length > 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ errors });
    }
    const eventData = { ...req.body };
    if (req.file) eventData.image = req.file.filename;
    const event = new Event(eventData);
    const saved = await event.save();
    res.status(201).json(saved);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    if (err.name === "ValidationError") return res.status(400).json({ errors: Object.values(err.errors).map(e => e.message) });
    res.status(500).json({ errors: [err.message] });
  }
});

// ── PUT UPDATE EVENT ──────────────────────────────────────────────────────────
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const errors = await validateEventData(req.body, req.params.id);
    if (errors.length > 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ errors });
    }
    const updateData = { ...req.body };
    if (req.file) {
      const old = await Event.findById(req.params.id);
      if (old?.image) { const op = path.join(uploadsDir, old.image); if (fs.existsSync(op)) fs.unlinkSync(op); }
      updateData.image = req.file.filename;
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ errors: ["Event not found"] });
    res.json(updated);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    if (err.name === "ValidationError") return res.status(400).json({ errors: Object.values(err.errors).map(e => e.message) });
    res.status(500).json({ errors: [err.message] });
  }
});

// ── PATCH STATUS (approve/reject with reason) ─────────────────────────────────
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, adminReason } = req.body;
    if (status === "rejected" && !adminReason) {
      return res.status(400).json({ errors: ["A reason is required when rejecting an event."] });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status, adminReason: adminReason || null, adminActionAt: new Date() },
      { new: true }
    );
    if (!event) return res.status(404).json({ errors: ["Event not found"] });
    res.json(event);
  } catch (err) {
    res.status(400).json({ errors: [err.message] });
  }
});

// ── DELETE EVENT with reason ──────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { adminReason } = req.body;
    if (!adminReason) return res.status(400).json({ errors: ["A reason is required when deleting an event."] });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ errors: ["Event not found"] });
    if (event.image) { const ip = path.join(uploadsDir, event.image); if (fs.existsSync(ip)) fs.unlinkSync(ip); }
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// Multer error
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ errors: ["Image must be 2MB or less."] });
  }
  if (err) return res.status(400).json({ errors: [err.message] });
  next();
});

module.exports = router;