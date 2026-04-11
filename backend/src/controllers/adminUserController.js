const loadModel = (path) => {
  try {
    return require(path);
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      return null;
    }
    throw error;
  }
};

const models = {
  users: loadModel("../models/user"),
  TableReservation: loadModel("../models/tableReservation"),
  OrderManagement: loadModel("../models/orderManagement"),
  MenuManagement: loadModel("../models/menuManagement"),
  InventoryManagement: loadModel("../models/inventoryManagement"),
  InquiryManagement: loadModel("../models/inquiryManagement"),
  FeedbackManagement: loadModel("../models/feedbackManagement"),
  DeliveryManagement: loadModel("../models/deliveryManagement"),
};

// Fetch all users/managers
exports.getUsers = (collectionName) => async (req, res) => {
  try {
    const Model = models[collectionName];
    if (!Model) return res.status(404).json({ message: "Collection is not available in this project" });

    const users = await Model.find().select("-__v");
    res.status(200).json({ users });
  } catch (err) {
    console.error(`Error fetching ${collectionName}:`, err);
    res.status(500).json({ message: `Failed to fetch ${collectionName}` });
  }
};

// Add new user/manager
exports.addUser = (collectionName) => async (req, res) => {
  try {
    const Model = models[collectionName];
    if (!Model) return res.status(404).json({ message: "Collection is not available in this project" });

    const { username, password, email, mobile } = req.body;
    let newUser;

    if (collectionName === "users") {
      if (!email || !mobile || !password) {
        return res.status(400).json({ message: "Email, mobile, and password required" });
      }
      newUser = new Model({ email, mobile, password });
    } else {
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      newUser = new Model({ username, password });
    }

    await newUser.save();
    res.status(201).json({ message: "Added successfully", user: newUser });
  } catch (err) {
    console.error(`Error adding to ${collectionName}:`, err);
    res.status(500).json({ message: "Add failed" });
  }
};

// Update user/manager
exports.updateUser = (collectionName) => async (req, res) => {
  try {
    const Model = models[collectionName];
    if (!Model) return res.status(404).json({ message: "Collection is not available in this project" });

    const user = await Model.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, password, email, mobile } = req.body;

    if (collectionName === "users") {
      if (email) user.email = email;
      if (mobile) user.mobile = mobile;
    } else {
      if (username) user.username = username;
      if (password) user.password = password;
    }

    await user.save();
    res.status(200).json({ message: "Updated successfully" });
  } catch (err) {
    console.error(`Error updating ${collectionName}:`, err);
    res.status(500).json({ message: "Update failed" });
  }
};

// Delete user/manager
exports.deleteUser = (collectionName) => async (req, res) => {
  try {
    const Model = models[collectionName];
    if (!Model) return res.status(404).json({ message: "Collection is not available in this project" });

    await Model.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(`Error deleting ${collectionName}:`, err);
    res.status(500).json({ message: "Delete failed" });
  }
};
