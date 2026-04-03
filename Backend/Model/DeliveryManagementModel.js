const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
}, { collection: 'DeliveryManagement' });

module.exports = mongoose.model("DeliveryManagement", schema);
