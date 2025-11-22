// src/controllers/uploadController.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// TEMP storage (stores file in memory for Cloudinary)
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage }).single("file");

// Upload file to Cloudinary
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "rental-hub" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const uploadResult = await streamUpload();

    return res.status(200).json({
      message: "File uploaded successfully",
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ message: "Upload failed", error });
  }
};
