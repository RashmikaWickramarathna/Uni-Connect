const SocietyRequest = require("../models/SocietyRequest");

const createSocietyRequest = async (req, res) => {
  try {
    const existingSociety = await SocietyRequest.findOne({
      $or: [
        { societyName: req.body.societyName },
        { officialEmail: req.body.officialEmail }
      ]
    });

    if (existingSociety) {
      return res.status(400).json({
        message: "Society name or official email already exists"
      });
    }

    const societyRequest = new SocietyRequest(req.body);
    await societyRequest.save();

    res.status(201).json({
      message: "Society registration request submitted successfully",
      data: societyRequest
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit society request",
      error: error.message
    });
  }
};

module.exports = { createSocietyRequest };