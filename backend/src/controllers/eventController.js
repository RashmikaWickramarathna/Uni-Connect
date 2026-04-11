const SocietyRequest = require("../models/societyRequest");
const Society = require("../models/society");
const Event = require("../models/event");

const verifyEventToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Check if it's a registered society token
    const society = await Society.findOne({ eventAccessToken: token, status: "Active" });
    if (society) {
      return res.json({
        valid: true,
        type: "society",
        societyId: society._id,
        societyName: society.societyName,
        officialEmail: society.officialEmail
      });
    }

    // Check if it's an approved request token (pre-registration)
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
        officialEmail: request.officialEmail
      });
    }

    return res.status(404).json({
      valid: false,
      message: "Invalid token"
    });
  } catch (error) {
    console.error("VERIFY EVENT TOKEN ERROR:", error);
    return res.status(500).json({
      message: "Failed to verify token",
      error: error.message
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const { token } = req.params;
    const eventData = req.body;

    if (!eventData.title || !eventData.description || !eventData.eventDate || !eventData.venue) {
      return res.status(400).json({ message: "Missing required event fields" });
    }

    // Verify token first
    const society = await Society.findOne({ eventAccessToken: token, status: "Active" });
    let societyId = null;
    let societyRequestId = null;

    if (society) {
      societyId = society._id;
    } else {
      const request = await SocietyRequest.findOne({ eventAccessToken: token, status: "Approved" });
      if (!request) {
        return res.status(404).json({ message: "Invalid token" });
      }

      if (request.eventAccessExpiresAt && request.eventAccessExpiresAt < new Date()) {
        return res.status(400).json({ message: "Event access token expired" });
      }
      societyRequestId = request._id;
    }

    const event = new Event({
      ...eventData,
      societyId,
      societyRequestId
    });

    await event.save();

    res.status(201).json({
      message: "Event created successfully",
      data: event
    });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    res.status(500).json({
      message: "Failed to create event",
      error: error.message
    });
  }
};

module.exports = {
  verifyEventToken,
  createEvent
};

