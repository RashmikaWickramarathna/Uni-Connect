// backend/controllers/eventController.js
const Event = require("../Model/Event");

// ── Get All Published Events ──────────────────
// GET /api/events
const getAllEvents = async (req, res) => {
  try {
    const { category, status, search, featured } = req.query;

    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (featured) filter.isFeatured = true;
    if (search) filter.$text = { $search: search };

    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error("❌ Get All Events Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── Get Single Event by ID ────────────────────
// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error("❌ Get Event Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── Create Event (Admin) ──────────────────────
// POST /api/events
const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ message: "✅ Event created successfully", event });
  } catch (err) {
    console.error("❌ Create Event Error:", err);
    res.status(500).json({ error: err.message, details: err.errors });
  }
};

// ── Update Event (Admin) ──────────────────────
// PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "✅ Event updated successfully", event });
  } catch (err) {
    console.error("❌ Update Event Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── Delete Event (Admin) ──────────────────────
// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "✅ Event deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Event Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── Get Upcoming Events ───────────────────────
// GET /api/events/upcoming
const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      isPublished: true,
      date: { $gte: new Date() },
      status: { $in: ["upcoming", "active"] },
    }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get Featured Events ───────────────────────
// GET /api/events/featured
const getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({
      isPublished: true,
      isFeatured: true,
      date: { $gte: new Date() },
    }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Publish / Unpublish Event (Admin) ─────────
// PATCH /api/events/:id/publish
const togglePublish = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.isPublished = !event.isPublished;
    await event.save();

    res.json({
      message: `✅ Event ${event.isPublished ? "published" : "unpublished"} successfully`,
      isPublished: event.isPublished,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get Event Stats (Admin) ───────────────────
// GET /api/events/stats
const getEventStats = async (req, res) => {
  try {
    const total      = await Event.countDocuments();
    const published  = await Event.countDocuments({ isPublished: true });
    const upcoming   = await Event.countDocuments({ status: "upcoming" });
    const active     = await Event.countDocuments({ status: "active" });
    const completed  = await Event.countDocuments({ status: "completed" });
    const cancelled  = await Event.countDocuments({ status: "cancelled" });

    const byCategory = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({ total, published, upcoming, active, completed, cancelled, byCategory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getFeaturedEvents,
  togglePublish,
  getEventStats,
};