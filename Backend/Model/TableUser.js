const mongoose = require("mongoose");

const TableUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: "TableReservation" });

module.exports = mongoose.model("TableUser", TableUserSchema);
