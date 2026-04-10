
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/bloodApp";
    await mongoose.connect(mongoURI); 
    if (process.env.NODE_ENV !== 'production') {
      console.log("MongoDB Connected Successfully....");
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("MongoDB Connection Failed :", error.message);
    }
    process.exit(1);
  }
};

module.exports = connectDB;