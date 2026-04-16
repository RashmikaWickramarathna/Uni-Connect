require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const inquiryRoutes = require("./src/routes/inquiryRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const userRoutes = require("./src/routes/userRoutes");
const adminUserRoutes = require("./src/routes/adminUserRoutes");
const societyReqRoutes = require("./src/routes/societyReqRoutes");
const societyApprovalRoutes = require("./src/routes/societyApprovalRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const { verifyTransporter, sendApprovalEmail } = require("./src/utils/emailService");

if (!process.env.EMAIL_PASS && process.env.EMAIL_PASSWORD) {
  process.env.EMAIL_PASS = process.env.EMAIL_PASSWORD;
}

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const maskEmail = (email) => {
  if (!email || typeof email !== "string") return "(not set)";

  const [local, domain] = email.split("@");
  if (!domain) return "(invalid)";

  return `${local.charAt(0) || "*"}***@${domain}`;
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_req, res) => {
  res.send("UNI-CONNECT backend is running");
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Uni-Connect backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin-users", adminUserRoutes);
app.use("/api/society-requests", societyReqRoutes);
app.use("/api/society-approval", societyApprovalRoutes);
app.use("/api/events", eventRoutes);

app.post("/api/test-email", async (req, res) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(503).json({
      message: "Email is not configured for this environment",
    });
  }

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

    return res.json({
      message: `Test email sent to ${maskEmail(to)}`,
    });
  } catch (error) {
    console.error("Test email failed:", error.message);
    return res.status(500).json({
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, _req, res, _next) => {
  console.error("GLOBAL ERROR:", error.stack || error.message || error);
  res.status(500).json({
    message: "Internal server error",
    error: error.message || "Unknown error",
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        verifyTransporter().catch((error) => {
          console.warn("Email transporter verification failed:", error.message);
        });
      } else {
        console.log("Email sender:", maskEmail(process.env.EMAIL_USER));
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
