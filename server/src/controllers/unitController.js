import asyncHandler from "../middleware/asyncHandler.js";
import Unit from "../models/Unit.js";
import Tenant from "../models/Tenant.js";

// GET /api/units - Only user's units
export const getUnits = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authenticated");
  }

  const units = await Unit.find({ userId: req.user._id }).populate("tenantId");
  res.json(units);
});

// POST /api/units
export const addUnit = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authenticated");
  }

  const unit = await Unit.create({
    ...req.body,
    userId: req.user._id,
  });

  res.status(201).json(unit);
});

// PUT /api/units/:id
export const updateUnit = asyncHandler(async (req, res) => {
  const unit = await Unit.findById(req.params.id);
  if (!unit) {
    res.status(404);
    throw new Error("Unit not found");
  }

  if (unit.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not allowed to update this unit");
  }

  // Handle tenant changes
  if ("tenantId" in req.body && req.body.tenantId !== String(unit.tenantId)) {
    if (unit.tenantId) await Tenant.findByIdAndUpdate(unit.tenantId, { unitId: null });
    if (req.body.tenantId) {
      await Tenant.findByIdAndUpdate(req.body.tenantId, { unitId: unit._id });
      req.body.status = "occupied";
    } else {
      req.body.status = "vacant";
    }
  }

  Object.assign(unit, req.body);
  await unit.save();
  res.json(unit);
});

// DELETE /api/units/:id
export const deleteUnit = asyncHandler(async (req, res) => {
  const unit = await Unit.findById(req.params.id);
  if (!unit) {
    res.status(404);
    throw new Error("Unit not found");
  }

  if (unit.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not allowed to delete this unit");
  }

  if (unit.tenantId) await Tenant.findByIdAndUpdate(unit.tenantId, { unitId: null });

  await Unit.findByIdAndDelete(req.params.id);
  res.json({ message: "Unit removed" });
});
