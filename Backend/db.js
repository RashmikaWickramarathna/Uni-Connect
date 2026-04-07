const mongoose = require("mongoose");

const DEFAULT_MONGO_URI =
  "mongodb+srv://it23794184_db_user:XdNioWm96obPPHsJ@cluster0.snvxyk1.mongodb.net/myDatabase?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || DEFAULT_MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
