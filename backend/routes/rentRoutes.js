import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { createRentDue, createTenantPayment, markAsPaid, listRents, getRent, deleteRent } from "../controllers/rentController.js";

const router = express.Router();

router.route("/")
  .get(protect, listRents)         // admin or tenant (filter by tenantId query for tenant)
  .post(protect, admin, createRentDue); // admin creates due

router.post("/self", protect, createTenantPayment); // tenant creates paid entry for self

router.route("/:id/pay")
  .put(protect, markAsPaid);       // tenant or admin can call to mark paid

router.route("/:id")
  .get(protect, getRent)
  .delete(protect, admin, deleteRent); // admin can delete payment

export default router;
