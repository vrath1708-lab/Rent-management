import express from "express";
import Tenant from "../models/Tenant.js";
import {
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant
} from "../controllers/tenantController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ⭐ Tenant Dashboard route (/api/tenants/me)
router.get("/me", protect, async (req, res) => {
  try {
    console.log("Tenant /me hit by:", req.user._id);

    const tenant = await Tenant.findOne({ userId: req.user._id });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant record not found" });
    }

    return res.json(tenant);

  } catch (error) {
    console.error("Tenant /me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN ROUTES
router
  .route("/")
  .get(protect, admin, getTenants)
  .post(protect, admin, createTenant);

// SPECIFIC TENANT
router
  .route("/:id")
  .get(protect, getTenant)
  .put(protect, admin, updateTenant)
  .delete(protect, admin, deleteTenant);

export default router;
