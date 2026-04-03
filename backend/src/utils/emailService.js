require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }, 
  tls: {
    rejectUnauthorized: false,
  },
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

const sendApprovalEmail = async (to, societyName, registrationLink, eventLink) => {
  try {
    const eventSection = eventLink
      ? `\n            <h3>Step 2: Create Your First Event</h3>\n            <p>Start creating events for your society:</p>\n            <a href="${eventLink}" class="button">Create Event Now</a>\n            <p><small>${eventLink}</small></p>\n        `
      : "";

    const noteText = eventLink
      ? "Both links expire in 24-48 hours. Contact admin if you need extension."
      : "The registration link expires in 24-48 hours. Contact admin if you need extension.";

    const htmlBody = `\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <style>\n            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n            .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }\n            .button:hover { background: #0056b3; }\n          </style>\n        </head>\n        <body>\n          <div class="container">\n            <h2>🎉 Congratulations! Your society <strong>${societyName}</strong> has been approved!</h2>\n            \n            <p>You now have access to UNI-CONNECT platform.</p>\n            \n            <h3>Step 1: Complete Society Registration</h3>\n            <p>Create your society account:</p>\n            <a href="${registrationLink}" class="button">Register Society Account</a>\n            <p><small>${registrationLink}</small></p>\n            ${eventSection}\n            <p><strong>Note:</strong> ${noteText}</p>\n            \n            <hr>\n            <p>Best regards,<br>UNI-CONNECT Team</p>\n          </div>\n        </body>\n        </html>\n      `;

    const info = await transporter.sendMail({
      from: `"UNI-CONNECT" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Society Approved - ${societyName}`,
      html: htmlBody
    });

    console.log(`Approval email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("Failed to send approval email:", err);
    throw err;
  }
};

module.exports = { sendApprovalEmail, verifyTransporter };

const sendEventAccessEmail = async (to, societyName, eventLink, adminName) => {
  try {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .button:hover { background: #1e7e34; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Event Access Link for <strong>${societyName}</strong></h2>
          <p>Hello,</p>
          <p>An administrator (${adminName || 'Admin'}) has sent you a link to create events for your society on UNI-CONNECT.</p>
          <p>Click the button below to create your event:</p>
          <a href="${eventLink}" class="button">Create Event</a>
          <p><small>${eventLink}</small></p>
          <p><strong>Note:</strong> This link is valid for 48 hours. Contact the admin if you need assistance.</p>
          <hr>
          <p>Best regards,<br>UNI-CONNECT Team</p>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"UNI-CONNECT" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Event Access - ${societyName}`,
      html: htmlBody
    });

    console.log(`Event access email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("Failed to send event access email:", err);
    throw err;
  }
};

module.exports = { sendApprovalEmail, verifyTransporter, sendEventAccessEmail };