require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
const Event = require("./models/Event");
const Reminder = require("./models/Reminder");
const Notification = require("./models/Notification");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

const eventRoutes = require("./routes/eventRoutes");
app.use("/api/events", eventRoutes);
app.get("/", (req, res) => res.send("Event API Running on port 5000"));

// DAILY REMINDER CRON - runs at 8:00 AM every day
cron.schedule("0 8 * * *", async () => {
  console.log("Running daily reminder check...");
  try {
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const now = new Date();
    const date7 = fmt(new Date(now.getTime()+7*24*60*60*1000));
    const date1 = fmt(new Date(now.getTime()+1*24*60*60*1000));

    for (const [date, type, field, label] of [[date7,"7_days","reminderSent7Days","7 days"],[date1,"1_day","reminderSent1Day","TOMORROW"]]) {
      const events = await Event.find({ date, status:"approved", [field]:false });
      for (const ev of events) {
        const msg = `Reminder: Your event "${ev.title}" is happening in ${label} on ${ev.date} at ${ev.venue}.`;
        await Reminder.create({ eventId:ev._id, eventTitle:ev.title, eventDate:ev.date, organizerEmail:ev.organizerEmail, reminderType:type, message:msg });
        await Notification.create({ recipientEmail:ev.organizerEmail, eventId:ev._id, eventTitle:ev.title, type:"reminder", message:msg });
        await Event.findByIdAndUpdate(ev._id,{ [field]:true });
        console.log(`${label} reminder sent for: ${ev.title}`);
      }
    }
    console.log("Reminder check done.");
  } catch(err) { console.error("Cron error:", err.message); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
