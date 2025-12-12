import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// In Docker: mongodb://admin:admin123@mongodb:27017/rent-management?authSource=admin
// Local: mongodb://admin:admin123@localhost:27017/rent-management?authSource=admin
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://admin:admin123@localhost:27017/rent-management?authSource=admin";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      // Mongoose 7 removed many options; keep default
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
