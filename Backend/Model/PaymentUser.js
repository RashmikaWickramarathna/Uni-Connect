const mongoose = require("mongoose");

const PaymentUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: "OnlinePaymentManagement" });

module.exports = mongoose.model("PaymentUser", PaymentUserSchema);
