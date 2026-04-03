const mongoose = require("mongoose");

const OrderUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: "OrderManagement" });

module.exports = mongoose.model("OrderUser", OrderUserSchema);
