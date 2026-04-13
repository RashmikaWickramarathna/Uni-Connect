const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const Reminder = require("../models/Reminder");

// MULTER
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-")),
});
const fileFilter = (req, file, cb) =>
  ["image/jpeg","image/png"].includes(file.mimetype) ? cb(null,true) : cb(new Error("Only JPG/PNG"),false);
const upload = multer({ storage, fileFilter, limits:{ fileSize: 2*1024*1024 } });

// VALIDATION
const validate = async (data, excludeId=null) => {
  const errors = [];
  const { title, description, date, time, venue, organizerEmail } = data;

  if (!title || title.trim().length < 5) errors.push("Title must be at least 5 characters.");
  if (title && title.trim().length > 100) errors.push("Title cannot exceed 100 characters.");
  if (!description || description.trim().length < 20) errors.push("Description must be at least 20 characters.");
  if (description && description.trim().length > 1000) errors.push("Description cannot exceed 1000 characters.");
  if (!organizerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail))
    errors.push("Valid email with @ is required.");
  if (!time) errors.push("Event time is required.");
  if (!venue || !venue.trim()) errors.push("Venue is required.");

  if (!date) {
    errors.push("Event date is required.");
  } else {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    if (date <= todayStr) errors.push("Date must be at least one day in the future.");
  }

  if (date) {
    const q = { date }; if (excludeId) q._id = { $ne: excludeId };
    const ex = await Event.findOne(q);
    if (ex) errors.push(`"${ex.title}" already scheduled on ${date}. Choose a different date.`);
  }
  if (date && venue) {
    const q = { date, venue: venue.trim() }; if (excludeId) q._id = { $ne: excludeId };
    const ex = await Event.findOne(q);
    if (ex) errors.push(`"${ex.title}" already using "${venue}" on ${date}. Choose a different venue or date.`);
  }
  if (organizerEmail && date && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail)) {
    const q = { organizerEmail: organizerEmail.toLowerCase(), date }; if (excludeId) q._id = { $ne: excludeId };
    const count = await Event.countDocuments(q);
    if (count >= 10) errors.push("Society limit of 10 events per day reached.");
  }
  return errors;
};

// GET ALL
router.get("/", async (req, res) => {
  try {
    const { email, role } = req.query;
    let query = {};
    if (role === "society" && email) query.organizerEmail = email.toLowerCase();
    const events = await Event.find(query).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) { res.status(500).json({ errors:[err.message] }); }
});

// ANALYTICS
router.get("/analytics", async (req, res) => {
  try {
    const all = await Event.find();
    const total = all.length;
    const approved = all.filter(e=>e.status==="approved").length;
    const rejected = all.filter(e=>e.status==="rejected").length;
    const pending = all.filter(e=>e.status==="pending").length;

    const byCategory = {};
    all.forEach(e => { byCategory[e.category]=(byCategory[e.category]||0)+1; });

    const byMonth = {};
    const now = new Date();
    for (let i=5;i>=0;i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      byMonth[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`] = 0;
    }
    all.forEach(e => { if(e.date){ const k=e.date.substring(0,7); if(byMonth.hasOwnProperty(k)) byMonth[k]++; } });

    const societyMap = {};
    all.forEach(e => {
      const k=e.organizerEmail||"unknown";
      if(!societyMap[k]) societyMap[k]={email:k,name:e.organizer,count:0,approved:0,rejected:0,pending:0};
      societyMap[k].count++;
      if(e.status==="approved") societyMap[k].approved++;
      if(e.status==="rejected") societyMap[k].rejected++;
      if(e.status==="pending") societyMap[k].pending++;
    });
    const topSocieties = Object.values(societyMap).sort((a,b)=>b.count-a.count).slice(0,5);

    const today = new Date();
    const todayStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const in30=new Date(today.getTime()+30*24*60*60*1000);
    const in30Str=`${in30.getFullYear()}-${String(in30.getMonth()+1).padStart(2,"0")}-${String(in30.getDate()).padStart(2,"0")}`;
    const upcoming=all.filter(e=>e.status==="approved"&&e.date>todayStr&&e.date<=in30Str).length;

    const categoryTrend = {};
    all.forEach(e => {
      const month = e.date ? e.date.substring(0,7) : null;
      if(month && byMonth.hasOwnProperty(month)) {
        if(!categoryTrend[e.category]) categoryTrend[e.category]=0;
        categoryTrend[e.category]++;
      }
    });

    res.json({ total,approved,rejected,pending,byCategory,byMonth,topSocieties,upcoming,categoryTrend });
  } catch(err) { res.status(500).json({ errors:[err.message] }); }
});

// REMINDERS
router.get("/reminders", async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ sentAt:-1 }).limit(50);
    res.json(reminders);
  } catch(err) { res.status(500).json({ errors:[err.message] }); }
});

// NOTIFICATIONS for society
router.get("/notifications/:email", async (req, res) => {
  try {
    const n = await Notification.find({ recipientEmail:req.params.email.toLowerCase() }).sort({ createdAt:-1 }).limit(30);
    res.json(n);
  } catch(err) { res.status(500).json({ errors:[err.message] }); }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try { await Notification.findByIdAndUpdate(req.params.id,{isRead:true}); res.json({ok:true}); }
  catch(err) { res.status(500).json({ errors:[err.message] }); }
});

router.patch("/notifications/read-all/:email", async (req, res) => {
  try { await Notification.updateMany({recipientEmail:req.params.email.toLowerCase()},{isRead:true}); res.json({ok:true}); }
  catch(err) { res.status(500).json({ errors:[err.message] }); }
});

// GET SINGLE
router.get("/:id", async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id,{$inc:{views:1}});
    const event = await Event.findById(req.params.id);
    if(!event) return res.status(404).json({errors:["Not found"]});
    res.json(event);
  } catch(err) { res.status(500).json({errors:[err.message]}); }
});

// CREATE
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const errors = await validate(req.body);
    if(errors.length>0){ if(req.file) fs.unlinkSync(req.file.path); return res.status(400).json({errors}); }
    const data = {...req.body};
    if(req.file) data.image=req.file.filename;
    const event = new Event(data);
    const saved = await event.save();
    res.status(201).json(saved);
  } catch(err) {
    if(req.file) fs.unlinkSync(req.file.path);
    if(err.name==="ValidationError") return res.status(400).json({errors:Object.values(err.errors).map(e=>e.message)});
    res.status(500).json({errors:[err.message]});
  }
});

// UPDATE
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const errors = await validate(req.body, req.params.id);
    if(errors.length>0){ if(req.file) fs.unlinkSync(req.file.path); return res.status(400).json({errors}); }
    const data = {...req.body};
    if(req.file) {
      const old = await Event.findById(req.params.id);
      if(old?.image){ const op=path.join(uploadsDir,old.image); if(fs.existsSync(op)) fs.unlinkSync(op); }
      data.image=req.file.filename;
    }
    const updated = await Event.findByIdAndUpdate(req.params.id,data,{new:true,runValidators:true});
    if(!updated) return res.status(404).json({errors:["Not found"]});
    res.json(updated);
  } catch(err) {
    if(req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({errors:[err.message]});
  }
});

// STATUS — approve or reject with notification to society
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, adminReason } = req.body;
    if(status==="rejected"&&!adminReason) return res.status(400).json({errors:["Reason required for rejection."]});
    const event = await Event.findByIdAndUpdate(req.params.id,{status,adminReason:adminReason||null,adminActionAt:new Date()},{new:true});
    if(!event) return res.status(404).json({errors:["Not found"]});

    const message = status==="approved"
      ? `Your event "${event.title}" has been approved! It is now confirmed for ${event.date}.`
      : `Your event "${event.title}" was rejected. Reason: ${adminReason}`;

    await Notification.create({recipientEmail:event.organizerEmail,eventId:event._id,eventTitle:event.title,type:status,message});
    res.json(event);
  } catch(err) { res.status(400).json({errors:[err.message]}); }
});

// DELETE with reason
router.delete("/:id", async (req, res) => {
  try {
    const { adminReason, deletedBy } = req.body;
    if(deletedBy==="admin"&&!adminReason) return res.status(400).json({errors:["Reason required."]});
    const event = await Event.findById(req.params.id);
    if(!event) return res.status(404).json({errors:["Not found"]});
    if(event.image){ const ip=path.join(uploadsDir,event.image); if(fs.existsSync(ip)) fs.unlinkSync(ip); }
    if(deletedBy==="admin"&&adminReason) {
      await Notification.create({recipientEmail:event.organizerEmail,eventId:event._id,eventTitle:event.title,type:"deleted",message:`Your event "${event.title}" was deleted by admin. Reason: ${adminReason}`});
    }
    await Event.findByIdAndDelete(req.params.id);
    res.json({message:"Deleted"});
  } catch(err) { res.status(500).json({errors:[err.message]}); }
});

router.use((err,req,res,next) => {
  if(err instanceof multer.MulterError&&err.code==="LIMIT_FILE_SIZE") return res.status(400).json({errors:["Image must be 2MB or less."]});
  if(err) return res.status(400).json({errors:[err.message]});
  next();
});

module.exports = router;