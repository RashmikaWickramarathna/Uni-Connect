const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  faculty: { type: String },
  academicYear: { type: String }
});

const advisorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  faculty: { type: String }
});

const societyRequestSchema = new mongoose.Schema(
  {
    societyName: { type: String, required: true, unique: true },
    shortName: { type: String },
    category: { type: String, required: true },
    faculty: { type: String, required: true },
    description: { type: String, required: true },
    objectives: { type: String },
    officialEmail: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },

    advisor: { type: advisorSchema, required: true },

    president: { type: memberSchema, required: true },
    secretary: { type: memberSchema, required: true },
    treasurer: { type: memberSchema, required: true },

    executiveMembers: {
      type: [memberSchema],
      validate: [(arr) => arr.length >= 3, "At least 3 executive members are required"]
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Incomplete", "Approval Link Sent", "Registered"],
      default: "Pending"
    },

    rejectionReason: { type: String, default: "" },
    adminComment: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("societyRequest", societyRequestSchema);