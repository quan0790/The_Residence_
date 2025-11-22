// server/src/routes/unitRoutes.js
import express from "express";
import { getUnits, addUnit, updateUnit, deleteUnit } from "../controllers/unitController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all units – requires login
router.get("/", protect, getUnits);

// POST create a unit – requires login
router.post("/", protect, addUnit);

// PUT update a unit – requires login
router.put("/:id", protect, updateUnit);

// DELETE a unit – requires login
router.delete("/:id", protect, deleteUnit);

export default router;
