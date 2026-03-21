const mongoose = require("mongoose");

const societySchema = new mongoose.Schema(
  {
    societyName: {
      type: String,
      required: true,
      unique: true
    },
    officialEmail: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    category: String,
    faculty: String,
    description: String,
    contactNumber: String,
    status: {
      type: String,
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Society", societySchema);