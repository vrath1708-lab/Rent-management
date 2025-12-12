import mongoose from "mongoose";

const tenantDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  roomNumber: { type: String, required: true },
  monthlyRent: { type: Number, required: true },
  maintenance: { type: Number, default: 0 },
  deposit: { type: Number, default: 0 },
  
  rentDueDate: { type: String, default: "5" }, // monthly due date (5th of each month)

  lastPaidMonth: { type: String, default: null },  // example: "Jan 2025"
  outstandingDues: { type: Number, default: 0 },

}, { timestamps: true });

export default mongoose.model("TenantDetails", tenantDetailsSchema);
