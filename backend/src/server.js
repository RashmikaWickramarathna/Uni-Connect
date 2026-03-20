require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const societyReqRoutes = require("./routes/societyReqRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/society-requests", societyReqRoutes);

// MongoDB Connection (ONLY ONCE)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("MERN Backend Running");
});

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});