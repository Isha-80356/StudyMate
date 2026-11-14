
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from backend folder
dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
      console.log("MONGO_URI found:", !!process.env.MONGO_URI);
      console.log("MONGODB_URI found:", !!process.env.MONGODB_URI);

      throw new Error("MongoDB URI is missing in .env");
    }

    await mongoose.connect(uri);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
