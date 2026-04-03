const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const MenuItem = require("../Model/MenuItem");

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ Get all menu items
router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// ✅ Add menu item
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const image = req.file ? "/uploads/" + req.file.filename : null;

    const newItem = new MenuItem({ name, price, category, image });
    await newItem.save();

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add menu item" });
  }
});

// ✅ Update menu item
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const updateData = { name, price, category };

    if (req.file) updateData.image = "/uploads/" + req.file.filename;

    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

// ✅ Delete menu item + image
router.delete("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    // Delete image
    if (item.image) {
      const imgPath = path.join(__dirname, "..", item.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

module.exports = router;
