import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // owner of the tenant
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" }, // assigned unit
    rentDueDay: { type: Number, default: 1 }, // day of month rent is due
    rentPaid: { type: Boolean, default: false },
    lastPaymentDate: { type: Date },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);

export default Tenant;
