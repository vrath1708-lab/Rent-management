import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { generateToken } from "../utils/generateToken.js";

// ===========================
// REGISTER (Auto-Creates Tenant)
// ===========================
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // 1. Check if user already exists
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    // 2. Create User
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || "tenant",
    });

    // 3. Auto-create tenant record IF user is tenant
    if (user.role === "tenant") {
      await Tenant.create({
        userId: user._id,
        name: user.name,
        email: user.email,

        phone: phone || "",
        roomNumber: "",
        rentAmount: 0,
        leaseStart: null,
        leaseEnd: null,
        securityDeposit: 0,
        notes: "",
      });
    }

    // 4. Respond
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user),
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// LOGIN
// ===========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user),
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// GET PROFILE
// ===========================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    return res.json(user);

  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
