const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

function mountRoute(mountPath, modulePath) {
  try {
    const router = require(modulePath);
    app.use(mountPath, router);
    console.log(`[routes] Mounted ${mountPath}`);
  } catch (error) {
    console.warn(`[routes] Skipped ${mountPath}: ${error.message}`);
  }
}

[
  { mountPath: "/api/admin", modulePath: "./Routes/adminRoutes" },
  { mountPath: "/api/users", modulePath: "./Routes/UserRoutes" },
  { mountPath: "/api/inquiries", modulePath: "./Routes/inquiryRoutes" },
  { mountPath: "/api/feedback", modulePath: "./Routes/feedbackRoutes" },
  { mountPath: "/api/faculties", modulePath: "./Routes/facultyRoutes" },
  { mountPath: "/api/events", modulePath: "./Routes/eventRotes" },
  { mountPath: "/api/payments", modulePath: "./Routes/PaymentRoute" },
  { mountPath: "/api/tickets", modulePath: "./Routes/ticketBookingRoutes" },
].forEach(({ mountPath, modulePath }) => {
  mountRoute(mountPath, modulePath);
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set in backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
