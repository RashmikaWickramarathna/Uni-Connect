const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");

// ✅ Create feedback
router.post("/", async (req, res) => {
  try {
    const { userId, name, email, rating, comments } = req.body;
    if (!userId || !name || !email || !rating || !comments) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const feedback = new Feedback({ userId, name, email, rating, comments });
    await feedback.save();
    res.status(201).json({ success: true, message: "Feedback submitted", feedback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get all feedbacks (for admin)
router.get("/all", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get user's feedbacks by userId
router.get("/my/:userId", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Update feedback (only by owner)
router.put("/:id", async (req, res) => {
  try {
    const { name, email, rating, comments } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }
    feedback.name = name || feedback.name;
    feedback.email = email || feedback.email;
    feedback.rating = rating || feedback.rating;
    feedback.comments = comments || feedback.comments;
    await feedback.save();
    res.json({ success: true, message: "Feedback updated", feedback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Delete feedback (only by owner)
router.delete("/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Admin reply to feedback
router.put("/:id/reply", async (req, res) => {
  try {
    const { adminReply } = req.body;
    if (!adminReply) {
      return res.status(400).json({ success: false, message: "Reply text is required" });
    }
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }
    feedback.adminReply = adminReply;
    feedback.repliedAt = new Date();
    await feedback.save();
    res.json({ success: true, message: "Reply added", feedback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
