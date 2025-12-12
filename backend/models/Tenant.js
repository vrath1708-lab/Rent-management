import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: String,
    email: String,
    phone: String,

    roomNumber: String,
    rentAmount: Number,
    leaseStart: Date,
    leaseEnd: Date,
    securityDeposit: Number,

    notes: String,
    isRegistered: { type: Boolean, default: false } // false = new tenant awaiting details, true = fully registered
  },
  { timestamps: true }
);

export default mongoose.model("Tenant", tenantSchema);
