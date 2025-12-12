import RentPayment from "../models/RentPayment.js";
import Tenant from "../models/Tenant.js";
import { isLate } from "../utils/calculateRentDue.js";
import { sendRentReminder, sendPaymentConfirmation } from "../utils/sendMail.js";

// create a rent due for a tenant (admin)
export const createRentDue = async (req, res) => {
  try {
    const { tenantId, amount, dueDate, notes } = req.body;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const rent = await RentPayment.create({
      tenant: tenantId,
      amount,
      dueDate,
      notes,
      status: isLate(dueDate) ? "late" : "pending"
    });

    // Send email reminder to tenant
    try {
      await sendRentReminder(tenant, rent);
    } catch (emailError) {
      console.error("Failed to send rent reminder email:", emailError.message);
      // Continue even if email fails
    }

    res.status(201).json(rent);
  } catch (error) {
    console.error("Create rent error:", error);
    res.status(500).json({ message: "Error creating rent", error: error.message });
  }
};

// tenant creates a paid record for current month
export const createTenantPayment = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user._id });
    if (!tenant) return res.status(404).json({ message: "Tenant record not found" });

    const { amount, month, method, notes } = req.body;
    if (!amount) return res.status(400).json({ message: "Amount is required" });

    // derive due date from month if provided, else use schema default
    const dueDate = month ? new Date(`${month}-05T00:00:00Z`) : undefined;

    const rent = await RentPayment.create({
      tenant: tenant._id,
      amount,
      month,
      method,
      notes,
      dueDate,
      paidOn: new Date(), // mark as paid immediately
    });

    // Send payment confirmation email
    try {
      await sendPaymentConfirmation(tenant, rent);
    } catch (emailError) {
      console.error("Failed to send payment confirmation email:", emailError.message);
      // Continue even if email fails
    }

    res.status(201).json(rent);
  } catch (error) {
    console.error("Create tenant payment error:", error);
    res.status(500).json({ message: "Error creating payment", error: error.message });
  }
};

// mark rent as paid (admin or tenant)
export const markAsPaid = async (req, res) => {
  try {
    const rent = await RentPayment.findById(req.params.id).populate("tenant");
    if (!rent) return res.status(404).json({ message: "Rent entry not found" });

    rent.paidOn = new Date();
    rent.method = req.body.method || rent.method;
    // Note: status will be auto-set to "paid" by the pre-save hook
    await rent.save();

    // Send payment confirmation email
    try {
      await sendPaymentConfirmation(rent.tenant, rent);
    } catch (emailError) {
      console.error("Failed to send payment confirmation email:", emailError.message);
      // Continue even if email fails
    }

    res.json(rent);
  } catch (error) {
    console.error("Mark as paid error:", error);
    res.status(500).json({ message: "Error marking as paid", error: error.message });
  }
};

// list rents (with optional filters)
export const listRents = async (req, res) => {
  try {
    const { tenantId, status } = req.query;
    const filter = {};
    if (tenantId) filter.tenant = tenantId;
    if (status) filter.status = status;

    const rents = await RentPayment.find(filter).populate("tenant", "name roomNumber email").sort({ dueDate: -1 });
    res.json(rents);
  } catch (error) {
    console.error("List rents error:", error);
    res.status(500).json({ message: "Error listing rents", error: error.message });
  }
};

// get rent by id
export const getRent = async (req, res) => {
  try {
    const rent = await RentPayment.findById(req.params.id).populate("tenant");
    if (!rent) return res.status(404).json({ message: "Rent not found" });
    res.json(rent);
  } catch (error) {
    console.error("Get rent error:", error);
    res.status(500).json({ message: "Error fetching rent", error: error.message });
  }
};

// delete rent (admin only - for removing mistaken payments)
export const deleteRent = async (req, res) => {
  try {
    const rent = await RentPayment.findByIdAndDelete(req.params.id);
    if (!rent) return res.status(404).json({ message: "Rent not found" });
    res.json({ message: "Rent payment deleted successfully", deletedRent: rent });
  } catch (error) {
    console.error("Delete rent error:", error);
    res.status(500).json({ message: "Error deleting rent", error: error.message });
  }
};
