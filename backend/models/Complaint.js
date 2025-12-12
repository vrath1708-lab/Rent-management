import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["pending", "in-progress", "resolved"], default: "pending" },
  assignedTo: { type: String }, // worker name or vendor
  images: [{ type: String }] // store S3/Cloud path or local path
}, { timestamps: true });

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
