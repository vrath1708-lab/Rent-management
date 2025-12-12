import express from "express";
import { createComplaint, listComplaints, getTenantComplaints, getComplaint, updateComplaint, markAsResolved } from "../controllers/complaintController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createComplaint)   // tenant creates
  .get(protect, admin, listComplaints); // admin lists all

// Tenant's own complaints
router.get("/my/complaints", protect, getTenantComplaints);

router.route("/:id")
  .get(protect, getComplaint)
  .put(protect, admin, updateComplaint); // admin updates status

// Mark complaint as resolved (admin only)
router.put("/:id/resolve", protect, admin, markAsResolved);

export default router;
