const express = require("express");
const router = express.Router();
const Inquiry = require("../Model/Inquiry");

// ✅ Create new inquiry
router.post("/", async (req, res) => {
  try {
    const { userId, name, email, subject, message } = req.body;
    if (!userId || !name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const inquiry = new Inquiry({ userId, name, email, subject, message });
    await inquiry.save();
    res.status(201).json({ success: true, message: "Inquiry submitted", inquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get all inquiries (admin)
router.get("/all", async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, inquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get user's inquiries by userId
router.get("/my/:userId", async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, inquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Update inquiry (only by owner)
router.put("/:id", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    inquiry.name = name || inquiry.name;
    inquiry.email = email || inquiry.email;
    inquiry.subject = subject || inquiry.subject;
    inquiry.message = message || inquiry.message;
    await inquiry.save();
    res.json({ success: true, message: "Inquiry updated", inquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Delete inquiry (only by owner)
router.delete("/:id", async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Inquiry deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Admin reply to inquiry
router.put("/:id/reply", async (req, res) => {
  try {
    const { adminReply } = req.body;
    if (!adminReply) {
      return res.status(400).json({ success: false, message: "Reply text is required" });
    }
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    inquiry.adminReply = adminReply;
    inquiry.repliedAt = new Date();
    await inquiry.save();
    res.json({ success: true, message: "Reply added", inquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;