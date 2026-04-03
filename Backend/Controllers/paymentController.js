const Payment = require("../Model/Payment");
const Inventory = require("../Model/Inventory");

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create new payment
exports.createPayment = async (req, res) => {
  const { orderNumber, items, totalAmount, paymentMethod, address, deliveryCharge } = req.body;

  if (!orderNumber || !items || !totalAmount || !paymentMethod || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Decrease inventory for each item
    for (const item of items) {
      const inventoryItem = await Inventory.findOne({ name: item.name });
      if (!inventoryItem) {
        return res.status(400).json({ message: `Item "${item.name}" not found in inventory` });
      }
      if (inventoryItem.quantity < item.count) {
        return res.status(400).json({ message: `Not enough stock for "${item.name}". Available: ${inventoryItem.quantity}` });
      }
      await Inventory.findOneAndUpdate(
        { name: item.name },
        { $inc: { quantity: -item.count } }
      );
    }

    const newPayment = new Payment({ orderNumber, items, totalAmount, paymentMethod, address, deliveryCharge });
    await newPayment.save();

    res.status(201).json({ message: "Payment saved successfully", payment: newPayment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete payment by ID
exports.deletePayment = async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Payment not found" });

    // Optionally, you can restore inventory if needed
    for (const item of deleted.items) {
      await Inventory.findOneAndUpdate(
        { name: item.name },
        { $inc: { quantity: item.count } }
      );
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
