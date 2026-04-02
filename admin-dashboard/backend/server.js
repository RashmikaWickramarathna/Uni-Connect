require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
const Event = require("./models/Event");
const Reminder = require("./models/Reminder");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── MONGODB ───────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await runReminderCheck();
  })
  .catch(err => console.log("MongoDB Error:", err));

// ── ROUTES ────────────────────────────────────────────────────────────────────
const eventRoutes = require("./routes/eventRoutes");
app.use("/api/events", eventRoutes);

app.post("/api/events/reminders/run", async (req, res) => {
  try {
    await runReminderCheck();
    res.json({ success: true, message: "Reminder check completed." });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

app.get("/", (req, res) => res.send("Admin API Running"));

// ── REMINDER CHECK FUNCTION ───────────────────────────────────────────────────
const runReminderCheck = async () => {
  console.log("Running reminder check...");
  try {
    const now = new Date();

    // Calculate target dates
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in1 = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

    const date7 = fmt(in7);
    const date1 = fmt(in1);

    // 7-day reminders — only approved events that haven't been reminded yet
    const events7 = await Event.find({ date: date7, status: "approved", reminderSent7Days: false });
    for (const ev of events7) {
      await Reminder.create({
        eventId: ev._id,
        eventTitle: ev.title,
        eventDate: ev.date,
        organizerEmail: ev.organizerEmail,
        reminderType: "7_days",
        message: `Reminder: "${ev.title}" is happening in 7 days on ${ev.date} at ${ev.venue}.`,
      });
      await Event.findByIdAndUpdate(ev._id, { reminderSent7Days: true });
      console.log(`7-day reminder saved for: ${ev.title}`);
    }

    // 1-day reminders
    const events1 = await Event.find({ date: date1, status: "approved", reminderSent1Day: false });
    for (const ev of events1) {
      await Reminder.create({
        eventId: ev._id,
        eventTitle: ev.title,
        eventDate: ev.date,
        organizerEmail: ev.organizerEmail,
        reminderType: "1_day",
        message: `Reminder: "${ev.title}" is happening TOMORROW on ${ev.date} at ${ev.venue}.`,
      });
      await Event.findByIdAndUpdate(ev._id, { reminderSent1Day: true });
      console.log(`1-day reminder saved for: ${ev.title}`);
    }

    console.log("Reminder check complete.");
  } catch (err) {
    console.error("Reminder cron error:", err.message);
  }
};

cron.schedule("0 8 * * *", runReminderCheck);

// ── START SERVER ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));