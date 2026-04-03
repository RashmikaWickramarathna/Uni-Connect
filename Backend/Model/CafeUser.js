const mongoose = require("mongoose");

const CafeUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: "UserManagement" });

module.exports = mongoose.model("CafeUser", CafeUserSchema);
