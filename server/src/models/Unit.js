import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // owner of the unit
    unitNumber: { type: String, required: true },
    type: { type: String, default: "Standard" },
    rentAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["vacant", "occupied"], default: "vacant" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" }, // current tenant if any
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const Unit = mongoose.models.Unit || mongoose.model("Unit", unitSchema);

export default Unit;
