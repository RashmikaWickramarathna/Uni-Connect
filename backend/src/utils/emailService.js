require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const verifyTransporter = async () =>
  new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error("Nodemailer verification failed:", error);
        return reject(error);
      }

      console.log("Nodemailer is ready to send messages");
      return resolve(success);
    });
  });

const sendApprovalEmail = async (
  to,
  societyName,
  registrationLink,
  eventLink,
  loginLink
) => {
  const eventSection = eventLink
    ? `
            <h3>Step 2: Create Your First Event</h3>
            <p>Start creating events for your society:</p>
            <a href="${eventLink}" class="button">Create Event Now</a>
            <p><small>${eventLink}</small></p>
        `
    : "";

  const loginSection = loginLink
    ? `
            <h3>${eventLink ? "Step 3" : "Step 2"}: Sign In to the Society Portal</h3>
            <p>After you create the password, use your official email and that same password to log in and manage events:</p>
            <a href="${loginLink}" class="button">Open Society Login</a>
            <p><small>${loginLink}</small></p>
        `
    : "";

  const noteText = eventLink
    ? "Registration and event access links expire in 24-48 hours. Contact admin if you need extension."
    : "The registration link expires in 24-48 hours. After registration, keep using your official email and chosen password to sign in.";

  const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .button:hover { background: #0056b3; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Congratulations! Your society <strong>${societyName}</strong> has been approved!</h2>
            <p>You now have access to UNI-CONNECT platform.</p>
            <h3>Step 1: Complete Society Registration</h3>
            <p>Open the registration link below and create the password for your society account:</p>
            <a href="${registrationLink}" class="button">Register Society Account</a>
            <p><small>${registrationLink}</small></p>
            ${eventSection}
            ${loginSection}
            <p><strong>Note:</strong> ${noteText}</p>
            <hr>
            <p>Best regards,<br>UNI-CONNECT Team</p>
          </div>
        </body>
        </html>
      `;

  try {
    return await transporter.sendMail({
      from: `"UNI-CONNECT" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Society Approved - ${societyName}`,
      html: htmlBody,
    });
  } catch (error) {
    console.error("Failed to send approval email:", error);
    throw error;
  }
};

const sendEventAccessEmail = async (to, societyName, eventLink, adminName) => {
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
          <p>An administrator (${adminName || "Admin"}) has sent you a link to create events for your society on UNI-CONNECT.</p>
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

  try {
    return await transporter.sendMail({
      from: `"UNI-CONNECT" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Event Access - ${societyName}`,
      html: htmlBody,
    });
  } catch (error) {
    console.error("Failed to send event access email:", error);
    throw error;
  }
};

module.exports = {
  sendApprovalEmail,
  sendEventAccessEmail,
  verifyTransporter,
};
