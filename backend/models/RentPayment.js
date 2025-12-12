import mongoose from "mongoose";

const rentPaymentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    // Helps identify each month
    month: {
      type: String, // e.g., "2025-11"
      required: false,
      default: () => new Date().toISOString().slice(0, 7) // YYYY-MM format
    },

    amount: {
      type: Number,
      required: true,
    },

    dueDate: {
      type: Date,
      required: false,
      default: () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5)
    },

    paidOn: {
      type: Date,
      default: null,
    },

    method: {
      type: String,
      enum: ["cash", "online", "razorpay", "cheque", "bank"],
      default: "online",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "late"],
      default: "pending",
    },

    lateFee: {
      type: Number,
      default: 0,
    },

    paymentId: {
      type: String, // Razorpay / Stripe transaction ID
    },

    notes: String,
  },
  { timestamps: true }
);

// AUTO SET STATUS + LATE FEE BEFORE SAVE
rentPaymentSchema.pre("save", function (next) {
  if (!this.paidOn) {
    // unpaid
    const today = new Date();
    if (this.dueDate && today > this.dueDate) {
      this.status = "late";
      this.lateFee = Math.round(this.amount * 0.02); // 2% late fee example
    } else {
      this.status = "pending";
    }
  } else {
    // paid
    this.status = "paid";
    this.lateFee = 0;
  }
  next();
});

export default mongoose.model("RentPayment", rentPaymentSchema);
