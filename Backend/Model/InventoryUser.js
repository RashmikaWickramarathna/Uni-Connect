const mongoose = require("mongoose");

const InventoryUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: "InventoryManagement" });

module.exports = mongoose.model("InventoryUser", InventoryUserSchema);
