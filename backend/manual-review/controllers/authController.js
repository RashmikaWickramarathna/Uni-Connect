const MenuUser = require("../Model/MenuUser");
const InventoryUser = require("../Model/InventoryUser");
const OrderUser = require("../Model/OrderUser");
const CafeUser = require("../Model/CafeUser");
const TableUser = require("../Model/TableUser");
const DeliveryUser = require("../Model/DeliveryUser");
const InquiryUser = require("../Model/InquiryUser");
const FeedbackUser = require("../Model/FeedbackUser");
const PaymentUser = require("../Model/PaymentUser");

// Map system -> Model
const systemModels = {
  menu: MenuUser,
  inventory: InventoryUser,
  order: OrderUser,
  user: CafeUser,
  table: TableUser,
  delivery: DeliveryUser,
  inquiry: InquiryUser,
  feedback: FeedbackUser,
  payment: PaymentUser
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { system, username, password } = req.body;

    if (!systemModels[system]) {
      return res.status(400).json({ success: false, message: "Invalid system" });
    }

    const Model = systemModels[system];
    const user = await Model.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true, message: "Login successful", system });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
