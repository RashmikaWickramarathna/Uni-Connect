const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  count: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const paymentSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  items: [itemSchema],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["Online", "COD"], required: true },
  address: {
    province: { type: String, required: true },
    city: { type: String, required: true },
    village: { type: String, required: true },
    fullAddress: { type: String, required: true }
  },
  deliveryCharge: { type: Number, default: 0 },
  status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
  deliveryNumber: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema);
