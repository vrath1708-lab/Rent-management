import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { logger } from "./config/logger.js";
import cors from "cors";
import "express-async-errors";
import authRoutes from "./routes/authRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import rentRoutes from "./routes/rentRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";


dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/rents", rentRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/email", emailRoutes);
console.log("TENANT ROUTES LOADED at /api/tenants");


// health
app.get("/api/health", (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// errors
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0',() => console.log(`Server running on port ${PORT}`));
