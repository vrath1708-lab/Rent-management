import express from "express";
import { register, login, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register); // you can restrict this to admin in route or change controller
router.post("/login", login);
router.get("/profile", protect, getProfile);

export default router;
