import { Router } from "express";
import { uploadMiddleware, uploadFile } from "../controllers/uploadController.js";

const router = Router();

router.post("/upload", uploadMiddleware, uploadFile);

export default router;
