import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  visibleTo: { type: String, enum: ["all", "tenants", "admins"], default: "all" },
  publishDate: { type: Date, default: Date.now },
  expireDate: { type: Date }
}, { timestamps: true });

const Notice = mongoose.model("Notice", noticeSchema);
export default Notice;
