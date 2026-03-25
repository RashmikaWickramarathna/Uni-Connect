require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const societyReqRoutes = require("./routes/societyReqRoutes");
const societyApprovalRoutes = require("./routes/societyApprovalRoutes");
const { verifyTransporter, sendApprovalEmail } = require("./utils/emailService");

// Mask email for logs: show first char and domain
const maskEmail = (email) => {
  if (!email || typeof email !== "string") return "(not set)";
  const [local, domain] = email.split("@");
  if (!domain) return "(invalid)";
  const first = local.charAt(0) || "*";
  return `${first}***@${domain}`;
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/society-requests", societyReqRoutes);
app.use("/api/society-approval", societyApprovalRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("MERN Backend Running");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));

// Global error handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    message: "Internal server error",
    error: err.message
  });
});

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Log masked sender and check email connectivity at startup
  console.log("Email sender:", maskEmail(process.env.EMAIL_USER));
  verifyTransporter()
    .then(() => console.log("Email transporter verified"))
    .catch((err) => console.warn("Email transporter verification failed. Check EMAIL_USER/EMAIL_PASS and network access.", err.message));
});

// Test email endpoint (POST) - body: { to?, societyName?, link? }
app.post("/api/test-email", async (req, res) => {
  const to = req.body && req.body.to ? req.body.to : process.env.EMAIL_USER;
  const societyName = (req.body && req.body.societyName) || "Test Society";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const link = (req.body && req.body.link) || frontendUrl;

  if (!to) {
    return res.status(400).json({ message: "No recipient provided and EMAIL_USER is not set" });
  }

  try {
    await sendApprovalEmail(to, societyName, link);
    console.log(`Test email sent to ${to}`);
    return res.json({ message: `Test email sent to ${maskEmail(to)}` });
  } catch (err) {
    console.error("Test email failed:", err);
    return res.status(500).json({ message: "Failed to send test email", error: err.message });
  }
});