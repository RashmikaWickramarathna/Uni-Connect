const Inventory = require("../Model/Inventory");

// Get all inventory items
exports.getAllInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create new inventory item
exports.createInventoryItem = async (req, res) => {
  const { name, quantity, price, category } = req.body;
  if (!name || !quantity || !price || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const newItem = new Inventory({ name, quantity, price, category });
    await newItem.save();
    res.status(201).json({ message: "Inventory item added", item: newItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { name, quantity, price, category } = req.body;

  try {
    const updated = await Inventory.findByIdAndUpdate(
      id,
      { name, quantity, price, category },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Inventory updated", item: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete inventory item by ID
exports.deleteInventoryItem = async (req, res) => {
  try {
    const deleted = await Inventory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Inventory item deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
