const crypto = require("crypto");

const ApprovalToken = require("../models/approvalToken");
const Society = require("../models/society");
const SocietyRequest = require("../models/societyRequest");
const { sendApprovalEmail, sendEventAccessEmail } = require("../utils/emailService");
const {
  buildRegistrationLink,
  getMainFrontendUrl,
} = require("../utils/frontendLinks");

const verifyApprovalToken = async (req, res) => {
  try {
    const { token } = req.params;
    const approvalToken = await ApprovalToken.findOne({ token });

    if (!approvalToken) {
      return res.status(404).json({ message: "Invalid token" });
    }

    if (approvalToken.isUsed) {
      return res.status(400).json({ message: "Token already used" });
    }

    if (approvalToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }

    const societyRequest = await SocietyRequest.findById(approvalToken.societyRequestId);

    return res.status(200).json({
      message: "Token is valid",
      valid: true,
      officialEmail: approvalToken.officialEmail,
      societyRequestId: approvalToken.societyRequestId,
      societyRequest,
    });
  } catch (error) {
    console.error("VERIFY APPROVAL TOKEN ERROR:", error);
    return res.status(500).json({
      message: "Failed to verify token",
      error: error.message,
    });
  }
};

const useApprovalToken = async (req, res) => {
  try {
    const { token } = req.params;
    const approvalToken = await ApprovalToken.findOne({ token });

    if (!approvalToken) {
      return res.status(404).json({ message: "Invalid token" });
    }

    if (approvalToken.isUsed) {
      return res.status(400).json({ message: "Token already used" });
    }

    if (approvalToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }

    approvalToken.isUsed = true;
    await approvalToken.save();

    return res.status(200).json({
      message: "Token marked as used successfully",
    });
  } catch (error) {
    console.error("USE APPROVAL TOKEN ERROR:", error);
    return res.status(500).json({
      message: "Failed to mark token as used",
      error: error.message,
    });
  }
};

const approveSociety = async (req, res) => {
  try {
    const society = await SocietyRequest.findById(req.params.id);

    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    if (society.status === "Rejected") {
      return res.status(400).json({
        message: "Cannot approve rejected society",
      });
    }

    const officialEmail =
      society.officialEmail ||
      society.email ||
      society.contactEmail;

    if (!officialEmail) {
      return res.status(400).json({ message: "Official email not found" });
    }

    await ApprovalToken.deleteMany({
      societyRequestId: society._id,
      isUsed: false,
    });

    const token = crypto.randomBytes(32).toString("hex");
    const approvalToken = new ApprovalToken({
      societyRequestId: society._id,
      officialEmail,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isUsed: false,
    });

    await approvalToken.save();

    const link = buildRegistrationLink(token);

    society.status = "Approved";
    society.approvalToken = token;
    society.approvalLink = link;

    await society.save();

    try {
      await sendApprovalEmail(
        officialEmail,
        society.societyName || society.name || "Society",
        link
      );

      return res.json({
        message: "Society approved and email sent successfully",
        approvalLink: link,
      });
    } catch (emailError) {
      console.error("APPROVAL EMAIL FAILED:", emailError);
      return res.status(200).json({
        message: "Society approved. Email notification pending.",
        approvalLink: link,
        emailError: emailError.message,
      });
    }
  } catch (error) {
    console.error("APPROVE SOCIETY ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

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
      isUsed: false,
    });

    await society.save();

    return res.json({
      message: "Society rejected successfully",
    });
  } catch (error) {
    console.error("REJECT SOCIETY ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const openApprovalLink = async (req, res) => {
  try {
    const { token } = req.params;
    const approvalToken = await ApprovalToken.findOne({ token });

    if (!approvalToken) {
      return res.status(404).send("Invalid token");
    }

    if (approvalToken.isUsed) {
      return res.status(400).send("Token already used");
    }

    if (approvalToken.expiresAt < new Date()) {
      return res.status(400).send("Token expired");
    }

    const redirectUrl = buildRegistrationLink(token);

    return res.redirect(302, redirectUrl);
  } catch (error) {
    console.error("OPEN APPROVAL LINK ERROR:", error);
    return res.status(500).send("Failed to open approval link");
  }
};

const sendEventLink = async (req, res) => {
  try {
    const request = await SocietyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Society request not found" });
    }

    if (!["Approved", "Registered"].includes(request.status)) {
      return res.status(400).json({
        message: "Event links can only be sent for approved or registered societies",
      });
    }

    const officialEmail =
      request.officialEmail ||
      request.email ||
      request.contactEmail;

    if (!officialEmail) {
      return res.status(400).json({ message: "Official email not found" });
    }

    const token = request.eventAccessToken || crypto.randomBytes(32).toString("hex");
    const frontendUrl = getMainFrontendUrl();
    const eventLink = `${frontendUrl}/create-event/${token}`;
    const adminName = req.body?.adminName || "Admin";

    request.eventAccessToken = token;
    request.eventAccessLink = eventLink;
    request.eventAccessExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    request.eventAccessSentBy = adminName;
    request.eventAccessSentAt = new Date();
    await request.save();

    const society = await Society.findOne({ officialEmail });
    if (society) {
      society.eventAccessToken = token;
      society.eventAccessLink = eventLink;
      await society.save();
    }

    try {
      await sendEventAccessEmail(
        officialEmail,
        request.societyName || "Society",
        eventLink,
        adminName
      );

      return res.status(200).json({
        message: "Event link sent successfully",
        eventAccessLink: eventLink,
        eventAccessSentAt: request.eventAccessSentAt,
        eventAccessSentBy: request.eventAccessSentBy,
      });
    } catch (emailError) {
      console.error("EVENT ACCESS EMAIL FAILED:", emailError);
      return res.status(200).json({
        message: "Event link created. Email notification pending.",
        eventAccessLink: eventLink,
        eventAccessSentAt: request.eventAccessSentAt,
        eventAccessSentBy: request.eventAccessSentBy,
        emailError: emailError.message,
      });
    }
  } catch (error) {
    console.error("Error sending event link:", error);
    return res.status(500).json({ message: "Failed to send event link" });
  }
};

module.exports = {
  verifyApprovalToken,
  useApprovalToken,
  approveSociety,
  rejectSociety,
  openApprovalLink,
  sendEventLink,
};
