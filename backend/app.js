const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

// Routes
const menuRoutes = require("./Routes/menuRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const reservationRoutes = require("./Routes/reservationRoutes");
const authRoutes = require("./Routes/authRoutes");
const inquiryRoutes = require("./Routes/inquiryRoutes");
const feedbackRoutes = require("./Routes/feedbackRoutes"); // ✅ NEW




const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// API Routes
app.use("/api/menu", menuRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/feedback", feedbackRoutes); // ✅ NEW
app.use("/api/payments", require("./Routes/paymentRoutes"));
app.use("/api/deliveries", require("./Routes/deliveryRoutes"));
app.use("/api/inventory", require("./Routes/inventoryRoutes"));
app.use("/api/users", require("./Routes/UserRoutes"));
app.use("/api/admin-users", require("./Routes/admin_User_Routes"));
app.use("/api/drivers", require("./Routes/driverRoutes")); // ✅ NEW

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://it23794184_db_user:XdNioWm96obPPHsJ@cluster0.snvxyk1.mongodb.net/myDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.log("❌ DB connection error:", err));
