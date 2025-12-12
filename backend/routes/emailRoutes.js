import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { sendMail, sendRentReminder, sendPaymentConfirmation, sendWelcomeEmail } from "../utils/sendMail.js";
import Tenant from "../models/Tenant.js";

const router = express.Router();

// Test email endpoint (admin only)
router.post("/test", protect, admin, async (req, res) => {
  try {
    const { to, type } = req.body;
    
    if (!to) {
      return res.status(400).json({ message: "Email address required" });
    }

    let result;
    
    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail({
          name: "Test User",
          email: to,
          roomNumber: "101",
          rentAmount: 10000
        });
        break;
        
      case "reminder":
        result = await sendRentReminder(
          { name: "Test User", email: to },
          { amount: 10000, dueDate: new Date(), month: "2025-12" }
        );
        break;
        
      case "confirmation":
        result = await sendPaymentConfirmation(
          { name: "Test User", email: to },
          { amount: 10000, paidOn: new Date(), method: "online", month: "2025-12" }
        );
        break;
        
      default:
        result = await sendMail({
          to,
          subject: "Test Email from Rent Management",
          html: "<h2>Test Email</h2><p>If you received this, your email service is working! ✅</p>"
        });
    }

    res.json({ 
      success: true, 
      message: "Test email sent successfully",
      result 
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send test email", 
      error: error.message 
    });
  }
});

// Send reminder to all tenants with pending rents (admin only)
router.post("/reminders/all", protect, admin, async (req, res) => {
  try {
    const tenants = await Tenant.find().populate({
      path: "userId",
      select: "email"
    });

    const results = [];
    
    for (const tenant of tenants) {
      try {
        // You can customize this to fetch actual pending rents
        const result = await sendRentReminder(tenant, {
          amount: tenant.rentAmount,
          dueDate: new Date(),
          month: new Date().toISOString().slice(0, 7)
        });
        results.push({ tenant: tenant.name, success: true, result });
      } catch (error) {
        results.push({ tenant: tenant.name, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Sent reminders to ${results.filter(r => r.success).length} tenants`,
      results
    });
  } catch (error) {
    console.error("Bulk reminder error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send reminders", 
      error: error.message 
    });
  }
});

export default router;
