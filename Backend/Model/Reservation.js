const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  packageType: { type: String, required: true },
  guests: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true },
  cardDetails: {
    cardNumber: String,
    expiry: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Reservation", ReservationSchema);
