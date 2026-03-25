const crypto = require("crypto");
const ApprovalToken = require("../models/approvalToken");
const SocietyRequest = require("../models/SocietyRequest");
const sendApprovalEmail = require("../utils/emailService");

// Note: manual token creation route removed to enforce single automatic approval flow.

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

// Approve society and auto-send email
const approveSociety = async (req, res) => {
  try {
    const society = await SocietyRequest.findById(req.params.id);

    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    if (society.status === "Rejected") {
      return res.status(400).json({
        message: "Cannot approve rejected society"
      });
    }

    const officialEmail =
      society.officialEmail ||
      society.email ||
      society.contactEmail;

    if (!officialEmail) {
      return res.status(400).json({
        message: "Official email not found"
      });
    }

    await ApprovalToken.deleteMany({
      societyRequestId: society._id,
      isUsed: false
    });

    const token = crypto.randomBytes(32).toString("hex");

    const approvalToken = new ApprovalToken({
      societyRequestId: society._id,
      officialEmail,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isUsed: false
    });

    await approvalToken.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    // Link should point to the frontend registration route
    const link = `${frontendUrl}/society-register/${token}`;

    society.status = "Approved";
    society.approvalToken = token;
    society.approvalLink = link;

    await society.save();

    // Attempt to send email but do not fail the approval if email sending fails.
    try {
      await sendApprovalEmail(
        officialEmail,
        society.societyName || society.name || "Society",
        link
      );

      return res.json({
        message: "Society approved and email sent successfully",
        approvalLink: link
      });
    } catch (emailErr) {
      console.error("APPROVAL EMAIL FAILED:", emailErr);
      return res.status(200).json({
        message: "Society approved. Email notification pending.",
        approvalLink: link,
        emailError: emailErr.message
      });
    }
  } catch (err) {
    console.error("APPROVE SOCIETY ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// Reject society
const rejectSociety = async (req, res) => {
  try {
    const society = await SocietyRequest.findById(req.params.id);

    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    society.status = "Rejected";
    society.approvalToken = null;
    society.approvalLink = null;

    await ApprovalToken.deleteMany({
      societyRequestId: society._id,
      isUsed: false
    });

    await society.save();

    return res.json({
      message: "Society rejected successfully"
    });
  } catch (err) {
    console.error("REJECT SOCIETY ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

module.exports = {
  verifyApprovalToken,
  useApprovalToken,
  approveSociety,
  rejectSociety
};