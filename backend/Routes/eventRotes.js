// backend/Routes/eventRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getFeaturedEvents,
  togglePublish,
  getEventStats,
} = require("../controllers/eventController");

// NOTE: specific paths must come before /:id

// GET  /api/events/stats
router.get("/stats", getEventStats);

// GET  /api/events/upcoming
router.get("/upcoming", getUpcomingEvents);

// GET  /api/events/featured
router.get("/featured", getFeaturedEvents);

// GET  /api/events
router.get("/", getAllEvents);

// POST /api/events
router.post("/", createEvent);

// GET  /api/events/:id
router.get("/:id", getEventById);

// PUT  /api/events/:id
router.put("/:id", updateEvent);

// DELETE /api/events/:id
router.delete("/:id", deleteEvent);

// PATCH /api/events/:id/publish
router.patch("/:id/publish", togglePublish);

module.exports = router;