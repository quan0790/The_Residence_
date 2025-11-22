import Payment from "../models/Payment.js";
import PDFDocument from "pdfkit";
import { Parser } from "json2csv";

// ===== Helpers =====
const normalizeDates = (from, to) => {
  const start = new Date(from);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const calculateTotals = (payments = []) => {
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  return { totalCollected };
};

const mapPayments = (payments) =>
  payments.map((p) => ({
    paymentId: p._id || null,
    tenant: {
      firstName: p.tenantId?.firstName || "Unknown",
      lastName: p.tenantId?.lastName || "",
    },
    unit: {
      unitNumber: p.unitId?.unitNumber || "N/A",
    },
    amount: p.amount || 0,
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
  }));

// ===== Monthly Report =====
export const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const payments = await Payment.find({
      userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate("tenantId", "firstName lastName")
      .populate("unitId", "unitNumber")
      .lean();

    const { totalCollected } = calculateTotals(payments);

    res.json({
      success: true,
      title: `Monthly Report (${now.toLocaleString("default", { month: "long" })})`,
      type: "monthly",
      createdAt: new Date(),
      payments: mapPayments(payments),
      totalCollected,
    });
  } catch (err) {
    next(err);
  }
};

// ===== Date Range Report =====
export const getDateRangeReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { from, to } = req.body;
    if (!from || !to) return res.status(400).json({ error: "Missing date range" });

    const { start, end } = normalizeDates(from, to);

    const payments = await Payment.find({
      userId,
      createdAt: { $gte: start, $lte: end },
    })
      .populate("tenantId", "firstName lastName")
      .populate("unitId", "unitNumber")
      .lean();

    const { totalCollected } = calculateTotals(payments);

    res.json({
      success: true,
      title: `Report (${from} → ${to})`,
      type: "range",
      createdAt: new Date(),
      payments: mapPayments(payments),
      totalCollected,
      dateRange: { from, to },
    });
  } catch (err) {
    next(err);
  }
};

// ===== Financial Report =====
export const getFinancialReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { from, to, expenses = 0 } = req.body;
    if (!from || !to) return res.status(400).json({ error: "Missing date range" });

    const { start, end } = normalizeDates(from, to);

    const payments = await Payment.find({
      userId,
      createdAt: { $gte: start, $lte: end },
    })
      .populate("tenantId", "firstName lastName")
      .populate("unitId", "unitNumber")
      .lean();

    const { totalCollected } = calculateTotals(payments);
    const netProfit = totalCollected - expenses;

    res.json({
      success: true,
      title: `Financial Report (${from} → ${to})`,
      type: "financial",
      createdAt: new Date(),
      payments: mapPayments(payments),
      totalCollected,
      expenses,
      netProfit,
      dateRange: { from, to },
    });
  } catch (err) {
    next(err);
  }
};

// ===== PDF Download =====
export const downloadPDFReport = async (req, res, next) => {
  try {
    const { payments, title } = req.body;
    if (!payments || payments.length === 0) return res.status(400).json({ error: "No data" });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${title || "report"}.pdf`);

    doc.pipe(res);
    doc.fontSize(20).text(title || "Report", { align: "center" });
    doc.moveDown();

    payments.forEach((p, i) => {
      doc.fontSize(12).text(
        `${i + 1}. Tenant: ${p.tenant?.firstName} ${p.tenant?.lastName} | Unit: ${p.unit?.unitNumber} | Amount: ${p.amount} | Date: ${p.createdAt}`
      );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    next(err);
  }
};

// ===== CSV Download =====
export const downloadCSVReport = async (req, res, next) => {
  try {
    const { payments, title } = req.body;
    if (!payments || payments.length === 0) return res.status(400).json({ error: "No data" });

    const parser = new Parser();
    const csv = parser.parse(payments);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${title || "report"}.csv`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
