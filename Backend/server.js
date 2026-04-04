const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const menuRoutes = require("./Routes/menuRoutes");
const inquiryRoutes = require("./Routes/inquiryRoutes"); // ✅ Import inquiry routes
const userRoutes = require("./Routes/UserRoutes"); // ✅ Import user routes
const feedbackRoutes = require("./Routes/feedbackRoutes"); // ✅ Import feedback routes

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/inquiries", inquiryRoutes); // ✅ Inquiry API
app.use("/api/users", userRoutes); // ✅ User API
app.use("/api/feedback", feedbackRoutes); // ✅ Feedback API

// MongoDB Atlas connection
mongoose
  .connect(
    "mongodb+srv://it23794184_db_user:XdNioWm96obPPHsJ@cluster0.snvxyk1.mongodb.net/myDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("✅ DB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.log("❌ DB connection error:", err));
