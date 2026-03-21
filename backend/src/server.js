require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const societyReqRoutes = require("./routes/societyReqRoutes");
const societyApprovalRoutes = require("./routes/societyApprovalRoutes");

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
});