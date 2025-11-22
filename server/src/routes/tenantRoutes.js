import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getTenants, createTenant, updateTenant, deleteTenant } from "../controllers/tenantController.js";

const router = express.Router();

router.get("/", protect, getTenants);
router.post("/", protect, createTenant);
router.put("/:id", protect, updateTenant);
router.delete("/:id", protect, deleteTenant);

export default router;
