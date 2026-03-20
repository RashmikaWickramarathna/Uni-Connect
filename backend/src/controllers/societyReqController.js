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

const getAllSocietyRequests = async (req, res) => {
  try {
    const requests = await SocietyRequest.find();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch society requests",
      error: error.message
    });
  }
};

const getSocietyRequestById = async (req, res) => {
  try {
    const request = await SocietyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Society request not found"
      });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch society request",
      error: error.message
    });
  }
};

const approveSocietyRequest = async (req, res) => {
  try {
    const request = await SocietyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Society request not found"
      });
    }

    request.status = "Approved";
    await request.save();

    res.status(200).json({
      message: "Society request approved successfully",
      data: request
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve society request",
      error: error.message
    });
  }
};

/*const rejectSocietyRequest = async (req, res) => {
  try {
    const request = await SocietyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Society request not found"
      });
    }

    request.status = "Rejected";
    request.rejectionReason = req.body.reason || "";
    await request.save();

    res.status(200).json({
      message: "Society request rejected successfully",
      data: request
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject society request",
      error: error.message
    });
  }
};*/
const rejectSocietyRequest = async (req, res) => {
  try {
    const request = await SocietyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Society request not found"
      });
    }

    request.status = "Rejected";
    request.rejectionReason = req.body && req.body.reason ? req.body.reason : "";

    await request.save();

    res.status(200).json({
      message: "Society request rejected successfully",
      data: request
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject society request",
      error: error.message
    });
  }
};

module.exports = {
  createSocietyRequest,
  getAllSocietyRequests,
  getSocietyRequestById,
  approveSocietyRequest,
  rejectSocietyRequest
};