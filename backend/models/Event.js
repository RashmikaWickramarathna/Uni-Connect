const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: [true,"Title required"], trim: true, minlength:[5,"Min 5 chars"], maxlength:[100,"Max 100 chars"] },
  description: { type: String, required: [true,"Description required"], minlength:[20,"Min 20 chars"], maxlength:[1000,"Max 1000 chars"] },
  date: { type: String, required: [true,"Date required"] },
  time: { type: String, required: [true,"Time required"] },
  venue: { type: String, required: [true,"Venue required"], trim: true },
  category: { type: String, enum:["Academic","Sports","Cultural","Social","Workshop","Other"], default:"Other" },
  organizer: { type: String, required: [true,"Organizer required"], trim: true },
  organizerEmail: { type: String, required: [true,"Email required"], trim: true, lowercase: true, match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/,"Invalid email"] },
  maxParticipants: { type: Number, default: 100, min:[1,"Min 1"] },
  status: { type: String, enum:["pending","approved","rejected"], default:"pending" },
  adminReason: { type: String, default: null },
  adminActionAt: { type: Date, default: null },
  image: { type: String, default: null },
  reminderSent7Days: { type: Boolean, default: false },
  reminderSent1Day: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);