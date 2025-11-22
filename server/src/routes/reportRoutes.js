import express from "express";
import {
  getMonthlyReport,
  getDateRangeReport,
  getFinancialReport,
  downloadPDFReport,
  downloadCSVReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes protected
router.use(protect);

router.get("/monthly", getMonthlyReport);
router.post("/range", getDateRangeReport);
router.post("/financial", getFinancialReport);

router.post("/pdf", downloadPDFReport);
router.post("/csv", downloadCSVReport);

export default router;
