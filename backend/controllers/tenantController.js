import Tenant from "../models/Tenant.js";
import RentPayment from "../models/RentPayment.js";
import moment from "moment";
import { sendWelcomeEmail } from "../utils/sendMail.js";

// ===========================================================
// AUTO-GENERATE RENT FOR THIS MONTH
// ===========================================================
const ensureCurrentMonthRent = async (tenant) => {
  const monthKey = moment().format("YYYY-MM");

  const exists = await RentPayment.findOne({
    tenant: tenant._id,
    month: monthKey,
  });

  if (exists) return exists;

  const rent = await RentPayment.create({
    tenant: tenant._id,
    month: monthKey,
    amount: tenant.rentAmount,
    dueDate: moment().startOf("month").add(5, "days"),
    status: "pending",
  });

  return rent;
};

// ===========================================================
// ADMIN CREATES TENANT MANUALLY
// ===========================================================
export const createTenant = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      phone,
      roomNumber,
      rentAmount,
      leaseStart,
      leaseEnd,
      securityDeposit,
      notes
    } = req.body;

    // REQUIRE userId (VERY IMPORTANT)
    if (!userId) {
      return res.status(400).json({
        message: "userId missing. Create user first, then pass userId."
      });
    }

    // DO NOT allow duplicate tenants for same user
    const userHasTenant = await Tenant.findOne({ userId });
    if (userHasTenant) {
      return res.status(400).json({ message: "Tenant already exists for this user." });
    }

    // Create tenant
    const tenant = await Tenant.create({
      userId,
      name,
      email,
      phone,
      roomNumber,
      rentAmount,
      leaseStart,
      leaseEnd,
      securityDeposit,
      notes,
      isRegistered: !!(roomNumber && rentAmount) // Mark as registered if both room and rent provided
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(tenant);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError.message);
      // Continue even if email fails
    }

    res.status(201).json(tenant);

  } catch (err) {
    console.error("Create tenant error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================================================
// ADMIN GET ALL TENANTS
// ===========================================================
export const getTenants = async (req, res) => {
  const tenants = await Tenant.find().sort({ roomNumber: 1 });
  res.json(tenants);
};

// ===========================================================
// ADMIN OR TENANT GET SPECIFIC TENANT
// ===========================================================
export const getTenant = async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });
  res.json(tenant);
};

// ===========================================================
// TENANT DASHBOARD → /api/tenants/me
// ===========================================================
export const getMyTenantDetails = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user._id });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant record missing" });
    }

    // Auto-create this month's rent entry
    const currentRent = await ensureCurrentMonthRent(tenant);

    // Fetch rent history
    const history = await RentPayment.find({ tenant: tenant._id })
      .sort({ dueDate: -1 });

    res.json({
      tenant,
      currentRent,
      history,
    });

  } catch (err) {
    console.error("Tenant /me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================================================
// ADMIN UPDATES TENANT
// ===========================================================
export const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const oldRent = tenant.rentAmount;

    Object.assign(tenant, req.body);

    // Mark as registered if room and rent are provided
    if (req.body.roomNumber && req.body.rentAmount) {
      tenant.isRegistered = true;
    }

    await tenant.save();

    // If rent is being set or changed, create current month's rent
    if (req.body.rentAmount) {
      const currentMonthKey = moment().format("YYYY-MM");
      
      // Check if current month rent exists
      const existingRent = await RentPayment.findOne({
        tenant: tenant._id,
        month: currentMonthKey
      });

      if (!existingRent) {
        // Create current month's rent
        await RentPayment.create({
          tenant: tenant._id,
          month: currentMonthKey,
          amount: req.body.rentAmount,
          dueDate: moment().startOf("month").add(5, "days").toDate(),
          status: "pending"
        });
      }

      // If rent changed → update next month's rent
      if (req.body.rentAmount !== oldRent) {
        const nextMonthKey = moment().add(1, "month").format("YYYY-MM");

        await RentPayment.findOneAndUpdate(
          { tenant: tenant._id, month: nextMonthKey },
          { 
            amount: req.body.rentAmount,
            dueDate: moment().add(1, "month").startOf("month").add(5, "days").toDate()
          },
          { upsert: true }
        );
      }
    }

    res.json(tenant);
  } catch (error) {
    console.error("Update tenant error:", error);
    res.status(500).json({ message: "Error updating tenant", error: error.message });
  }
};

// ===========================================================
// DELETE TENANT + RENT HISTORY
// ===========================================================
export const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    await RentPayment.deleteMany({ tenant: tenant._id });
    await Tenant.findByIdAndDelete(req.params.id);

    res.json({ message: "Tenant removed" });
  } catch (error) {
    console.error("Delete tenant error:", error);
    res.status(500).json({ message: "Error deleting tenant", error: error.message });
  }
};
