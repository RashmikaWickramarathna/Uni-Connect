const Payment = require("../Model/Payment");
const Delivery = require("../Model/Delivery");

// Get all pending orders for admin
exports.getPendingOrders = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Accept order
exports.acceptOrder = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Order not found" });

    if (payment.status !== "Pending")
      return res.status(400).json({ message: "Order already processed" });

    payment.status = "Accepted";
    payment.deliveryNumber = "DEL-" + Date.now();
    await payment.save();

    // Save to deliveries collection
    const delivery = new Delivery({
      orderNumber: payment.orderNumber,
      deliveryNumber: payment.deliveryNumber,
      items: payment.items,
      totalAmount: payment.totalAmount,
      address: payment.address,
      status: "Accepted"
    });
    await delivery.save();

    res.json({ message: "Order Accepted", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Reject order
exports.rejectOrder = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Order not found" });

    if (payment.status !== "Pending")
      return res.status(400).json({ message: "Order already processed" });

    payment.status = "Rejected";
    await payment.save();

    const delivery = new Delivery({
      orderNumber: payment.orderNumber,
      deliveryNumber: null,
      items: payment.items,
      totalAmount: payment.totalAmount,
      address: payment.address,
      status: "Rejected"
    });
    await delivery.save();

    res.json({ message: "Order Rejected", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all deliveries for frontend
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find().sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
