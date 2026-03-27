require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const societyReqRoutes = require("./routes/societyReqRoutes");
const societyApprovalRoutes = require("./routes/societyApprovalRoutes");
const { verifyTransporter, sendApprovalEmail } = require("./utils/emailService");

// Check required environment variables
const requiredEnvVars = ["MONGO_URI", "EMAIL_USER", "EMAIL_PASS"];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error("Missing environment variables:", missingVars.join(", "));
  console.error("Please create backend/.env file and add the required values.");
  process.exit(1);
}

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

// Test route
app.get("/", (req, res) => {
  res.send("MERN Backend Running");
});

// Test email endpoint
app.post("/api/test-email", async (req, res) => {
  const to = req.body?.to || process.env.EMAIL_USER;
  const societyName = req.body?.societyName || "Test Society";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const link = req.body?.link || frontendUrl;

  if (!to) {
    return res.status(400).json({
      message: "No recipient provided and EMAIL_USER is not set",
    });
  }

  try {
    await sendApprovalEmail(to, societyName, link);
    console.log(`Test email sent to ${maskEmail(to)}`);
    return res.json({
      message: `Test email sent to ${maskEmail(to)}`,
    });
  } catch (err) {
    console.error("Test email failed:", err.message);
    return res.status(500).json({
      message: "Failed to send test email",
      error: err.message,
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack || err.message || err);
  res.status(500).json({
    message: "Internal server error",
    error: err.message || "Unknown error",
  });
});

// Server start + DB connect
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Email sender:", maskEmail(process.env.EMAIL_USER));

      verifyTransporter()
        .then(() => console.log("Email transporter verified"))
        .catch((err) => {
          console.warn(
            "Email transporter verification failed. Check EMAIL_USER/EMAIL_PASS and network access.",
            err.message
          );
        });
    });
  } catch (err) {
    console.error("Mongo Error:", err.message);
    process.exit(1);
  }
};

startServer();