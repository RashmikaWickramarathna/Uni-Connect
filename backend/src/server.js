// backend/src/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ── Core Middleware ───────────────────────────
const { requestLogger } = require("./middleware/loggerMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { generalLimiter } = require("./middleware/rateLimitMiddleware");

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(generalLimiter); // global rate limit

// ── Routes ────────────────────────────────────
const ticketRoutes = require("../Routes/ticketBookingRoutes");
const paymentRoutes = require("../Routes/PaymentRoute");
const adminRoutes  = require("../Routes/adminRoutes");
const eventRoutes  = require("../Routes/eventRotes");

app.use("/api/tickets", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);

// ── Health Check ──────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "UniConnect API Running", status: "ok" });
});

// ── Error Middleware (must be LAST) ───────────
app.use(notFound);
app.use(errorHandler);

// ── MongoDB + Start ───────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });