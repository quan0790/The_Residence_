import asyncHandler from "../middleware/asyncHandler.js";
import Tenant from "../models/Tenant.js";
import Unit from "../models/Unit.js";

// GET /api/tenants - only user's tenants
export const getTenants = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authenticated");
  }

  const tenants = await Tenant.find({ userId: req.user._id }).populate("unitId");
  res.json(tenants);
});

// POST /api/tenants
export const createTenant = asyncHandler(async (req, res) => {
  req.body.userId = req.user._id;
  const tenant = await Tenant.create(req.body);

  // Assign tenant to unit if provided
  if (tenant.unitId) {
    await Unit.findByIdAndUpdate(tenant.unitId, {
      tenantId: tenant._id,
      status: "occupied",
    });
  }

  res.status(201).json(tenant);
});

// PUT /api/tenants/:id
export const updateTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) {
    res.status(404);
    throw new Error("Tenant not found");
  }

  // Ensure tenant belongs to current user
  if (String(tenant.userId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to update this tenant");
  }

  Object.assign(tenant, req.body);
  await tenant.save();

  // Update unit status if tenant assigned to a unit
  if ("unitId" in req.body) {
    if (tenant.unitId) {
      await Unit.findByIdAndUpdate(tenant.unitId, {
        tenantId: tenant._id,
        status: "occupied",
      });
    }
  }

  res.json(tenant);
});

// DELETE /api/tenants/:id
export const deleteTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) {
    res.status(404);
    throw new Error("Tenant not found");
  }

  if (String(tenant.userId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to delete this tenant");
  }

  // Vacate unit if assigned
  if (tenant.unitId) {
    await Unit.findByIdAndUpdate(tenant.unitId, { tenantId: null, status: "vacant" });
  }

  await Tenant.findByIdAndDelete(req.params.id);
  res.json({ message: "Tenant removed" });
});
