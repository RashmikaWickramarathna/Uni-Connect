const crypto = require("crypto");
const ApprovalToken = require("../models/approvalToken");
const SocietyRequest = require("../models/SocietyRequest");

// Create approval token + link
const createApprovalToken = async (req, res) => {
  try {
    const { societyRequestId } = req.body;

    if (!societyRequestId) {
      return res.status(400).json({
        message: "societyRequestId is required"
      });
    }

    const societyRequest = await SocietyRequest.findById(societyRequestId);

    if (!societyRequest) {
      return res.status(404).json({
        message: "Society request not found"
      });
    }

    // Adjust this field name if your model uses a different email field
    const officialEmail =
      societyRequest.officialEmail ||
      societyRequest.email ||
      societyRequest.contactEmail;

    if (!officialEmail) {
      return res.status(400).json({
        message: "Official email not found in society request"
      });
    }

    // remove previous unused tokens for same request
    await ApprovalToken.deleteMany({
      societyRequestId,
      isUsed: false
    });

    const token = crypto.randomBytes(32).toString("hex");

    const approvalToken = new ApprovalToken({
      societyRequestId,
      officialEmail,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isUsed: false
    });

    await approvalToken.save();

    societyRequest.status = "Approval Link Sent";
    await societyRequest.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const approvalLink = `${frontendUrl}/society-register/${token}`;

    return res.status(201).json({
      message: "Approval token created successfully",
      token,
      approvalLink,
      expiresAt: approvalToken.expiresAt
    });
  } catch (error) {
    console.error("CREATE APPROVAL TOKEN ERROR:", error);
    return res.status(500).json({
      message: "Failed to create approval token",
      error: error.message
    });
  }
};

// Verify token
const verifyApprovalToken = async (req, res) => {
  try {
    const { token } = req.params;

    const approvalToken = await ApprovalToken.findOne({ token });

    if (!approvalToken) {
      return res.status(404).json({
        message: "Invalid token"
      });
    }

    if (approvalToken.isUsed) {
      return res.status(400).json({
        message: "Token already used"
      });
    }

    if (approvalToken.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Token expired"
      });
    }

    const societyRequest = await SocietyRequest.findById(
      approvalToken.societyRequestId
    );

    return res.status(200).json({
      message: "Token is valid",
      valid: true,
      officialEmail: approvalToken.officialEmail,
      societyRequestId: approvalToken.societyRequestId,
      societyRequest
    });
  } catch (error) {
    console.error("VERIFY APPROVAL TOKEN ERROR:", error);
    return res.status(500).json({
      message: "Failed to verify token",
      error: error.message
    });
  }
};

// Mark token as used
const useApprovalToken = async (req, res) => {
  try {
    const { token } = req.params;

    const approvalToken = await ApprovalToken.findOne({ token });

    if (!approvalToken) {
      return res.status(404).json({
        message: "Invalid token"
      });
    }

    if (approvalToken.isUsed) {
      return res.status(400).json({
        message: "Token already used"
      });
    }

    if (approvalToken.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Token expired"
      });
    }

    approvalToken.isUsed = true;
    await approvalToken.save();

    return res.status(200).json({
      message: "Token marked as used successfully"
    });
  } catch (error) {
    console.error("USE APPROVAL TOKEN ERROR:", error);
    return res.status(500).json({
      message: "Failed to mark token as used",
      error: error.message
    });
  }
};

module.exports = {
  createApprovalToken,
  verifyApprovalToken,
  useApprovalToken
};