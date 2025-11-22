import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
const File = mongoose.models.File || mongoose.model("File", fileSchema);

export default File;
