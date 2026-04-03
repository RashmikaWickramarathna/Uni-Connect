const mongoose = require("mongoose");

const DeliveryUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: "DeliveryManagement" });

module.exports = mongoose.model("DeliveryUser", DeliveryUserSchema);
