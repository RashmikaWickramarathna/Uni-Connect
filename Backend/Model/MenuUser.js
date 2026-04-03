const mongoose = require("mongoose");

const MenuUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: "MenuManagement" });

module.exports = mongoose.model("MenuUser", MenuUserSchema);
