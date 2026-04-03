const mongoose = require("mongoose");

const approvalTokenSchema = new mongoose.Schema(
  {
    societyRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocietyRequest",
      required: true
    },
    officialEmail: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isUsed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApprovalToken", approvalTokenSchema);