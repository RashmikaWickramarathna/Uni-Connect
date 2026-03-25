require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter connectivity
const verifyTransporter = async () => {
  return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error("Nodemailer verification failed:", error);
        return reject(error);
      }
      console.log("Nodemailer is ready to send messages");
      resolve(success);
    });
  });
};

const sendApprovalEmail = async (to, societyName, link) => {
  try {
    const info = await transporter.sendMail({
      from: `"UNI-CONNECT" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Society Approved - ${societyName}`,
      html: `
        <h2>Society Approved</h2>
        <p>Your society <strong>${societyName}</strong> has been approved.</p>
        <p>Click below to access the registration page:</p>
        <a href="${link}">${link}</a>
      `
    });

    console.log(`Approval email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("Failed to send approval email:", err);
    throw err;
  }
};

module.exports = { sendApprovalEmail, verifyTransporter };