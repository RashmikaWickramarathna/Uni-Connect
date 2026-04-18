const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-mail.outlook.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send booking confirmation
const sendBookingEmail = async (ticket) => {
  // Check if credentials exist
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ Email disabled - missing EMAIL_USER/EMAIL_PASS in .env');
    return false;
  }

  const transporter = createTransporter();
  
  // Inline QR code base64 (generate server-side or use ticket number)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.ticketNumber}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ticket.email,
    subject: `🎫 UniConnect Ticket Confirmation - ${ticket.ticketNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; background: linear-gradient(135deg, #4361ee, #3b82f6); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; }
    .ticket-section { background: #f8fafc; padding: 25px; border-radius: 12px; margin: 20px 0; border-left: 5px solid #22c55e; }
    .ticket-number { font-size: 24px; font-weight: bold; color: #1e293b; letter-spacing: 2px; text-align: center; margin: 20px 0; }
    .qr-code { text-align: center; margin: 20px 0; }
    .qr-code img { max-width: 200px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .detail { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .detail-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { font-weight: 600; font-size: 16px; color: #1e293b; margin-top: 5px; }
    .status { padding: 10px 20px; border-radius: 25px; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
    .status.confirmed { background: #dcfce7; color: #16a34a; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 14px; }
    @media (max-width: 600px) { .details-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div className="header">
    <h1>🎫 Ticket Confirmed!</h1>
    <p>Your booking for <strong>${ticket.eventTitle}</strong> is confirmed</p>
  </div>
  
  <div className="ticket-section">
    <div className="ticket-number">${ticket.ticketNumber}</div>
    <div className="qr-code">
      <img src="${qrCodeUrl}" alt="QR Code" />
      <p style="color: #64748b; font-size: 14px; margin-top: 10px;">Show this QR at event entrance</p>
    </div>
  </div>
  
  <div className="ticket-section">
    <h3 style="margin-bottom: 20px; color: #1e293b;">Event Details</h3>
    <div className="details-grid">
      <div className="detail">
        <div className="detail-label">Date & Time</div>
        <div className="detail-value">${new Date(ticket.eventDate).toLocaleString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      <div className="detail">
        <div className="detail-label">Venue</div>
        <div className="detail-value">${ticket.venue}</div>
      </div>
      <div className="detail">
        <div className="detail-label">Ticket Type</div>
        <div className="detail-value">${ticket.ticketType.replace('_', ' ')} × ${ticket.quantity}</div>
      </div>
      <div className="detail">
        <div className="detail-label">Total</div>
        <div className="detail-value">${ticket.totalAmount === 0 ? 'FREE' : 'Rs. ' + ticket.totalAmount.toLocaleString()}</div>
      </div>
    </div>
  </div>
  
  <div className="ticket-section">
    <h3 style="margin-bottom: 15px; color: #1e293b;">Status</h3>
    <span className="status confirmed">✅ Confirmed</span>
  </div>
  
  <div className="footer">
    <p>Bring your ticket number or QR code to the event. Questions? Contact event organizer.</p>
    <p><strong>UniConnect</strong> | University Event Ticketing</p>
  </div>
</body>
</html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return false;
  }
};

module.exports = { sendBookingEmail };

