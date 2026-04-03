const SocietyRequest = require("../models/SocietyRequest");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const ApprovalToken = require("../models/approvalToken");
const Society = require("../models/society");

const createSocietyRequest = async (req, res) => {
  try {
    let body = req.body;

    // If form-data with file upload is used
    if (req.file) {
      if (req.body && req.body.payload) {
        try {
          body = JSON.parse(req.body.payload);
        } catch (err) {
          return res.status(400).json({ message: "Invalid payload format" });
        }
      }

      body.signatureLetter = {
        filePath: req.file.path.replace(/\\/g, "/"),
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      };
    }

    const existingSociety = await SocietyRequest.findOne({
      $or: [
        { societyName: body.societyName },
        { officialEmail: body.officialEmail },
      ],
    });

    if (existingSociety) {
      return res.status(400).json({
        message: "Society name or official email already exists",
      });
    }

    const societyRequest = new SocietyRequest(body);
    await societyRequest.save();

    return res.status(201).json({
      message: "Society registration request submitted successfully",
      data: societyRequest,
    });
  } catch (error) {
    console.error("CREATE SOCIETY REQUEST ERROR:", error);
    return res.status(500).json({
      message: "Failed to submit society request",
      error: error.message,
    });
  }
};

const getAllSocietyRequests = async (req, res) => {
  try {
    const requests = await SocietyRequest.find().sort({ createdAt: -1 });
    return res.status(200).json(requests);
  } catch (error) {
    console.error("GET ALL SOCIETY REQUESTS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch society requests",
      error: error.message,
    });
  }
};

const getSocietyRequestById = async (req, res) => {
  try {
    const request = await SocietyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Society request not found",
      });
    }

    return res.status(200).json(request);
  } catch (error) {
    console.error("GET SOCIETY REQUEST BY ID ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch society request",
      error: error.message,
    });
  }
};

// Kept for compatibility, but approval should happen via societyApprovalRoutes
const approveSocietyRequest = async (req, res) => {
  return res.status(405).json({
    message: "Use /api/society-approval/approve/:id to approve societies",
  });
};

const rejectSocietyRequest = async (req, res) => {
  try {
    const request = await SocietyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Society request not found",
      });
    }

    request.status = "Rejected";
    request.rejectionReason =
      req.body && req.body.reason ? req.body.reason : "";

    await request.save();

    return res.status(200).json({
      message: "Society request rejected successfully",
      data: request,
    });
  } catch (error) {
    console.error("REJECT SOCIETY REQUEST ERROR:", error);
    return res.status(500).json({
      message: "Failed to reject society request",
      error: error.message,
    });
  }
};

const registerApprovedSociety = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required",
      });
    }

    const approvalToken = await ApprovalToken.findOne({ token });

    if (!approvalToken) {
      return res.status(404).json({
        message: "Invalid approval token",
      });
    }

    if (approvalToken.isUsed) {
      return res.status(400).json({
        message: "This approval link has already been used",
      });
    }

    if (approvalToken.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Approval link has expired",
      });
    }

    const request = await SocietyRequest.findById(approvalToken.societyRequestId);

    if (!request) {
      return res.status(404).json({
        message: "Society request not found",
      });
    }

    const existingSociety = await Society.findOne({
      officialEmail: request.officialEmail,
    });

    if (existingSociety) {
      return res.status(400).json({
        message: "Society account already exists",
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
      status: "Active",
      eventAccessToken: request.eventAccessToken || crypto.randomBytes(32).toString("hex"),
      eventAccessLink: request.eventAccessLink || null,
    });

    await society.save();

    approvalToken.isUsed = true;
    await approvalToken.save();

    request.status = "Registered";
    await request.save();

    return res.status(201).json({
      message: "Society account created successfully",
      data: society,
    });
  } catch (error) {
    console.error("REGISTER APPROVED SOCIETY ERROR:", error);
    return res.status(500).json({
      message: "Failed to register approved society",
      error: error.message,
    });
  }
};

module.exports = {
  createSocietyRequest,
  getAllSocietyRequests,
  getSocietyRequestById,
  approveSocietyRequest,
  rejectSocietyRequest,
  registerApprovedSociety,
};