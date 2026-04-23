const path = require("path");

const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");

const adminRoutes = require("../Routes/adminRoutes");
const eventRoutes = require("../Routes/eventRotes");
const facultyRoutes = require("../Routes/facultyRoutes");
const paymentRoutes = require("../Routes/PaymentRoute");
const ticketRoutes = require("../Routes/ticketBookingRoutes");

const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { requestLogger } = require("./middleware/loggerMiddleware");
const { generalLimiter } = require("./middleware/rateLimitMiddleware");
const societyApprovalRoutes = require("./routes/societyApprovalRoutes");
const societyEventRoutes = require("./routes/eventRoutes");
const societyReqRoutes = require("./routes/societyReqRoutes");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "Uni-Connect API is running" });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api", generalLimiter);

app.use("/api/society-requests", societyReqRoutes);
app.use("/api/society-approval", societyApprovalRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events", societyEventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculties", facultyRoutes);

app.use(notFound);
app.use(errorHandler);

async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set. Starting server without a database connection.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.warn("Server will keep running, but database-backed routes will not work until MongoDB is available.");
  }
}

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

connectDatabase();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close().catch(() => {});
  server.close(() => process.exit(0));
});

module.exports = app;
