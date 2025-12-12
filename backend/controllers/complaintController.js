import Complaint from "../models/Complaint.js";
import Tenant from "../models/Tenant.js";

export const createComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // Get user ID from JWT
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find tenant by userId
    const tenant = await Tenant.findOne({ userId });
    if (!tenant) return res.status(404).json({ message: "Tenant profile not found. Please contact admin." });

    const complaint = await Complaint.create({ 
      tenant: tenant._id, 
      title, 
      description, 
      status: "pending" 
    });
    await complaint.populate("tenant", "name roomNumber email");
    
    res.status(201).json(complaint);
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ message: "Error creating complaint", error: error.message });
  }
};

export const listComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("tenant", "name roomNumber email").sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Error listing complaints:", error);
    res.status(500).json({ message: "Error listing complaints", error: error.message });
  }
};

export const getTenantComplaints = async (req, res) => {
  try {
    // Get user ID from JWT token
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find tenant by userId
    const tenant = await Tenant.findOne({ userId });
    if (!tenant) return res.status(404).json({ message: "Tenant profile not found" });

    const complaints = await Complaint.find({ tenant: tenant._id })
      .populate("tenant", "name roomNumber email")
      .sort({ createdAt: -1 });
    
    res.json(complaints);
  } catch (error) {
    console.error("Error getting tenant complaints:", error);
    res.status(500).json({ message: "Error getting complaints", error: error.message });
  }
};

export const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("tenant");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (error) {
    console.error("Error getting complaint:", error);
    res.status(500).json({ message: "Error getting complaint", error: error.message });
  }
};

export const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = req.body.status || complaint.status;
    complaint.assignedTo = req.body.assignedTo || complaint.assignedTo;
    if (req.body.description) complaint.description = req.body.description;

    await complaint.save();
    await complaint.populate("tenant", "name roomNumber email");
    res.json(complaint);
  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({ message: "Error updating complaint", error: error.message });
  }
};

export const markAsResolved = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = "resolved";
    await complaint.save();
    await complaint.populate("tenant", "name roomNumber email");
    
    res.json({ message: "Complaint marked as resolved", complaint });
  } catch (error) {
    console.error("Error resolving complaint:", error);
    res.status(500).json({ message: "Error resolving complaint", error: error.message });
  }
};
