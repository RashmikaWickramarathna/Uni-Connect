const SocietyRequest = require("../models/SocietyRequest");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const ApprovalToken = require("../models/approvalToken");
const Society = require("../models/society");

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

    if (request.status === "Approved") {
      return res.status(400).json({
        message: "Society request is already approved"
      });
    }

    request.status = "Approved";
    await request.save();

    const token = crypto.randomBytes(32).toString("hex");

    const approvalToken = new ApprovalToken({
      societyRequestId: request._id,
      officialEmail: request.officialEmail,
      token: token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await approvalToken.save();

    const approvalLink = `http://localhost:3000/society-register/${token}`;

    res.status(200).json({
      message: "Society request approved successfully",
      approvalLink,
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

const registerApprovedSociety = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required"
      });
    }

    const approvalToken = await ApprovalToken.findOne({ token });

    if (!approvalToken) {
      return res.status(404).json({
        message: "Invalid approval token"
      });
    }

    if (approvalToken.isUsed) {
      return res.status(400).json({
        message: "This approval link has already been used"
      });
    }

    if (approvalToken.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Approval link has expired"
      });
    }

    const request = await SocietyRequest.findById(approvalToken.societyRequestId);

    if (!request) {
      return res.status(404).json({
        message: "Society request not found"
      });
    }

    const existingSociety = await Society.findOne({
      officialEmail: request.officialEmail
    });

    if (existingSociety) {
      return res.status(400).json({
        message: "Society account already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const society = new Society({
      societyName: request.societyName,
      officialEmail: request.officialEmail,
      password: hashedPassword,
      category: request.category,
      faculty: request.faculty,
      description: request.description,
      contactNumber: request.contactNumber,
      status: "Active"
    });

    await society.save();

    approvalToken.isUsed = true;
    await approvalToken.save();

    request.status = "Registered";
    await request.save();

    res.status(201).json({
      message: "Society account created successfully",
      data: society
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to register approved society",
      error: error.message
    });
  }
};

module.exports = {
  createSocietyRequest,
  getAllSocietyRequests,
  getSocietyRequestById,
  approveSocietyRequest,
  rejectSocietyRequest,
  registerApprovedSociety
};