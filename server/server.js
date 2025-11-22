import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import tenantRoutes from "./src/routes/tenantRoutes.js";
import unitRoutes from "./src/routes/unitRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import errorHandler from "./src/middleware/errorHandler.js";

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// Health endpoints
app.get("/healthz", (req, res) => res.send("OK")); // Render health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/reports", reportRoutes);

// Global error handler (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
