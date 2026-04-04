const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  admin_username: { type: String, required: true, unique: true },
  admin_pwd: { type: String, required: true }
});

module.exports = mongoose.model("Admin", adminSchema, "admins");
