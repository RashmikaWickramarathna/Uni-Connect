const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Event = require("../models/Event");

// ─── MULTER SETUP ────────────────────────────────────────────────────────────

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

// Only allow JPG and PNG
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and PNG image files are allowed"), false);
  }
};

// Max 2MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// ─── VALIDATION HELPER ───────────────────────────────────────────────────────

const validateEventData = async (data, excludeId = null) => {
  const errors = [];
  const { title, description, date, organizerEmail } = data;

  // Title length
  if (title) {
    if (title.trim().length < 5)
      errors.push("Event title must be at least 5 characters long.");
    if (title.trim().length > 100)
      errors.push("Event title cannot exceed 100 characters.");
  }

  // Description length
  if (description) {
    if (description.trim().length < 20)
      errors.push("Description must be at least 20 characters long.");
    if (description.trim().length > 1000)
      errors.push("Description cannot exceed 1000 characters.");
  }

  // Email format
  if (organizerEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(organizerEmail))
      errors.push("Please enter a valid email address (must contain @).");
  }

  // Date must be strictly in the future (not today, not past)
  if (date) {
    const now = new Date();
    const todayStr =
      now.getFullYear() +
      "-" + String(now.getMonth() + 1).padStart(2, "0") +
      "-" + String(now.getDate()).padStart(2, "0");

    if (date <= todayStr) {
      errors.push("Event date must be at least one day in the future. Today and past dates are not allowed.");
    }
  }

  // Same date conflict check
  if (date) {
    const query = { date };
    if (excludeId) query._id = { $ne: excludeId };
    const existingOnDate = await Event.findOne(query);
    if (existingOnDate) {
      errors.push(`"${existingOnDate.title}" is already scheduled on ${date}. Please choose a different date.`);
    }
  }

  // Same society (email) max 10 events per day
  if (organizerEmail && date) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(organizerEmail)) {
      const query = { organizerEmail: organizerEmail.toLowerCase(), date };
      if (excludeId) query._id = { $ne: excludeId };
      const countOnDay = await Event.countDocuments(query);
      if (countOnDay >= 10) {
        errors.push(`The society with email ${organizerEmail} has already reached the limit of 10 events on ${date}.`);
      }
    }
  }

  return errors;
};

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("GET /events error:", err.message);
    res.status(500).json({ errors: [err.message] });
  }
});

// GET single event
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ errors: ["Event not found"] });
    res.json(event);
  } catch (err) {
    console.error("GET /events/:id error:", err.message);
    res.status(500).json({ errors: [err.message] });
  }
});

// POST create new event
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("POST /events body:", req.body); // log what arrived

    const errors = await validateEventData(req.body);
    if (errors.length > 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ errors });
    }

    const eventData = { ...req.body };
    if (req.file) eventData.image = req.file.filename;

    const event = new Event(eventData);
    const savedEvent = await event.save();
    console.log("Event saved:", savedEvent._id);
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error("POST /events error:", err.message);
    if (req.file) fs.unlinkSync(req.file.path);

    // Mongoose validation errors — convert to a readable list
    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ errors: validationErrors });
    }

    res.status(500).json({ errors: [err.message] });
  }
});

// PUT update event
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("PUT /events/:id body:", req.body);

    const errors = await validateEventData(req.body, req.params.id);
    if (errors.length > 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ errors });
    }

    const updateData = { ...req.body };

    if (req.file) {
      const oldEvent = await Event.findById(req.params.id);
      if (oldEvent && oldEvent.image) {
        const oldPath = path.join(uploadsDir, oldEvent.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = req.file.filename;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedEvent) return res.status(404).json({ errors: ["Event not found"] });
    res.json(updatedEvent);
  } catch (err) {
    console.error("PUT /events/:id error:", err.message);
    if (req.file) fs.unlinkSync(req.file.path);

    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ errors: validationErrors });
    }

    res.status(500).json({ errors: [err.message] });
  }
});

// PATCH approve or reject
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!event) return res.status(404).json({ errors: ["Event not found"] });
    res.json(event);
  } catch (err) {
    console.error("PATCH status error:", err.message);
    res.status(400).json({ errors: [err.message] });
  }
});

// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ errors: ["Event not found"] });
    if (event.image) {
      const imgPath = path.join(uploadsDir, event.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err.message);
    res.status(500).json({ errors: [err.message] });
  }
});

// Handle multer file errors
router.use((err, req, res, next) => {
  console.error("Multer error:", err.message);
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ errors: ["Image file size must be 2MB or less."] });
    }
  }
  if (err) {
    return res.status(400).json({ errors: [err.message] });
  }
  next();
});

module.exports = router;