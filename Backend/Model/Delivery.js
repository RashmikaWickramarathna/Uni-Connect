const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  orderNumber: { type: String, required: true },
  deliveryNumber: { type: String, default: null }, // removed unique
  items: [
    {
      name: String,
      count: Number,
      price: Number,
      subtotal: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  address: {
    province: { type: String },
    city: { type: String },
    village: { type: String },
    fullAddress: { type: String }
  },
  status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Delivery", deliverySchema);
