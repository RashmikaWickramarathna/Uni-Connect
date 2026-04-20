const nodemailer = require("nodemailer");

const { getMainFrontendUrl } = require("../src/utils/frontendLinks");
const { humanizeTicketType } = require("../src/utils/ticketing");

let QRCode = null;

try {
  QRCode = require("qrcode");
} catch (error) {
  console.warn(
    'Ticket email QR generation is unavailable because the "qrcode" package could not be loaded.'
  );
}

const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const createTransporter = () => {
  const emailHost = String(process.env.EMAIL_HOST || "").trim();
  const emailService = String(process.env.EMAIL_SERVICE || "").trim();
  const port = Number(process.env.EMAIL_PORT) || (emailHost ? 587 : undefined);

  if (emailHost) {
    return nodemailer.createTransport({
      host: emailHost,
      port,
      secure: process.env.EMAIL_SECURE === "true" || port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return nodemailer.createTransport({
    service: emailService || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDateTime = (value) => {
  if (!value) return "To be announced";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "To be announced";
  }

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
};

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  if (amount === 0) return "Free";

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatPaymentMethod = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return "Not specified";

  return normalized
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatStatus = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return "Unknown";

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/_/g, " ");
};

const buildDetailsHtml = (rows) =>
  rows
    .map(
      ([label, value]) => `
        <div class="detail-row">
          <div class="detail-label">${escapeHtml(label)}</div>
          <div class="detail-value">${escapeHtml(value)}</div>
        </div>
      `
    )
    .join("");

const buildDetailsText = (rows) =>
  rows.map(([label, value]) => `${label}: ${value}`).join("\n");

const buildQrAttachment = async (ticket) => {
  if (!QRCode) {
    throw new Error('The "qrcode" package is required to generate ticket QR emails.');
  }

  const qrBuffer = await QRCode.toBuffer(String(ticket.ticketNumber || ""), {
    type: "png",
    width: 300,
    margin: 2,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  return {
    filename: `${String(ticket.ticketNumber || "ticket").replace(/[^a-z0-9_-]/gi, "_")}.png`,
    content: qrBuffer,
    contentType: "image/png",
    cid: "booking-ticket-qr",
  };
};

const sendBookingEmail = async (ticket) => {
  if (!isEmailConfigured()) {
    console.log("Ticket email skipped: EMAIL_USER/EMAIL_PASS are not configured.");
    return { skipped: true, reason: "email_not_configured" };
  }

  if (!ticket?.email || !ticket?.ticketNumber) {
    throw new Error("Ticket email requires both recipient email and ticket number.");
  }

  const transporter = createTransporter();
  const ticketName =
    String(ticket.ticketLabel || "").trim() ||
    humanizeTicketType(ticket.ticketType || "general");
  const ticketCount = Math.max(1, Number(ticket.quantity) || 1);
  const myTicketsUrl = `${getMainFrontendUrl()}/my-tickets`;
  const qrAttachment = await buildQrAttachment(ticket);

  const attendeeRows = [
    ["Booked By", ticket.studentName || "Not provided"],
    ["Student ID", ticket.studentId || "Not provided"],
    ["Email", ticket.email || "Not provided"],
    ["Phone", ticket.phone || "Not provided"],
    ["Faculty", ticket.faculty || "Not provided"],
  ];

  const bookingRows = [
    ["Ticket Number", ticket.ticketNumber || "Not available"],
    ["Ticket Type", ticketName],
    ["Ticket Count", String(ticketCount)],
    ["Price Per Ticket", formatCurrency(ticket.unitPrice)],
    ["Total Cost", formatCurrency(ticket.totalAmount)],
    ["Booking Status", formatStatus(ticket.status)],
    ["Payment Status", formatStatus(ticket.paymentStatus)],
    ["Payment Method", formatPaymentMethod(ticket.paymentMethod)],
  ];

  const eventRows = [
    ["Event", ticket.eventTitle || "Event"],
    ["Date & Time", formatDateTime(ticket.eventDate)],
    ["Venue", ticket.venue || "To be announced"],
    ["Booked At", formatDateTime(ticket.bookedAt || ticket.createdAt)],
  ];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Uni-Connect Ticket Confirmation</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f3f6fb;
            font-family: Arial, sans-serif;
            color: #0f172a;
          }
          .wrapper {
            max-width: 680px;
            margin: 0 auto;
            padding: 24px 16px 40px;
          }
          .hero {
            background: linear-gradient(135deg, #0f766e, #0f172a);
            color: #ffffff;
            border-radius: 20px;
            padding: 28px 24px;
          }
          .hero h1 {
            margin: 0 0 8px;
            font-size: 28px;
          }
          .hero p {
            margin: 0;
            font-size: 15px;
            line-height: 1.6;
          }
          .card {
            background: #ffffff;
            border-radius: 18px;
            padding: 24px;
            margin-top: 18px;
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
          }
          .section-title {
            margin: 0 0 16px;
            font-size: 18px;
            color: #0f172a;
          }
          .ticket-number {
            display: inline-block;
            margin-top: 12px;
            padding: 10px 14px;
            background: #ecfeff;
            color: #155e75;
            border-radius: 999px;
            font-weight: 700;
            letter-spacing: 0.4px;
          }
          .qr-wrap {
            text-align: center;
            padding: 8px 0 0;
          }
          .qr-wrap img {
            width: 220px;
            max-width: 100%;
            border-radius: 18px;
            border: 1px solid #e2e8f0;
            padding: 12px;
            background: #ffffff;
          }
          .qr-note {
            margin: 14px 0 0;
            color: #475569;
            font-size: 14px;
            line-height: 1.6;
          }
          .detail-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .detail-row {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 14px;
          }
          .detail-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
            margin-bottom: 6px;
          }
          .detail-value {
            font-size: 15px;
            font-weight: 600;
            line-height: 1.5;
            color: #0f172a;
            word-break: break-word;
          }
          .cta {
            display: inline-block;
            margin-top: 18px;
            background: #0f766e;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 18px;
            border-radius: 12px;
            font-weight: 700;
          }
          .footer {
            margin-top: 18px;
            color: #64748b;
            font-size: 13px;
            line-height: 1.7;
            text-align: center;
          }
          @media (max-width: 640px) {
            .detail-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="hero">
            <h1>Your ticket is ready</h1>
            <p>
              Your booking for <strong>${escapeHtml(ticket.eventTitle || "your event")}</strong> has been recorded successfully.
              Keep this email and show the QR code at the entrance.
            </p>
            <div class="ticket-number">${escapeHtml(ticket.ticketNumber)}</div>
          </div>

          <div class="card">
            <h2 class="section-title">Booking QR</h2>
            <div class="qr-wrap">
              <img src="cid:${qrAttachment.cid}" alt="Ticket QR code" />
              <p class="qr-note">
                This booking QR covers <strong>${escapeHtml(String(ticketCount))}</strong>
                ticket${ticketCount > 1 ? "s" : ""}. You can also find it again from My Tickets.
              </p>
            </div>
            <a class="cta" href="${escapeHtml(myTicketsUrl)}">Open My Tickets</a>
          </div>

          <div class="card">
            <h2 class="section-title">Booked User Details</h2>
            <div class="detail-grid">
              ${buildDetailsHtml(attendeeRows)}
            </div>
          </div>

          <div class="card">
            <h2 class="section-title">Ticket Summary</h2>
            <div class="detail-grid">
              ${buildDetailsHtml(bookingRows)}
            </div>
          </div>

          <div class="card">
            <h2 class="section-title">Event Details</h2>
            <div class="detail-grid">
              ${buildDetailsHtml(eventRows)}
            </div>
          </div>

          <div class="footer">
            Uni-Connect Ticketing<br />
            If you cannot see the QR image above, the same QR is attached to this email as a PNG file.
          </div>
        </div>
      </body>
    </html>
  `;

  const text = [
    `Your ticket for ${ticket.eventTitle || "your event"} is ready.`,
    "",
    "Booked User Details",
    buildDetailsText(attendeeRows),
    "",
    "Ticket Summary",
    buildDetailsText(bookingRows),
    "",
    "Event Details",
    buildDetailsText(eventRows),
    "",
    `My Tickets: ${myTicketsUrl}`,
  ].join("\n");

  const info = await transporter.sendMail({
    from: `"UNI-CONNECT" <${process.env.EMAIL_USER}>`,
    to: String(ticket.email).trim().toLowerCase(),
    subject: `Your Uni-Connect ticket for ${ticket.eventTitle || "your event"}`,
    html,
    text,
    attachments: [qrAttachment],
  });

  console.log(`Ticket email sent to ${ticket.email}: ${info.messageId}`);
  return info;
};

module.exports = { sendBookingEmail, isEmailConfigured };
