import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    type: String,
    title: String,
    params: Object,
    rawData: Array,
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;
