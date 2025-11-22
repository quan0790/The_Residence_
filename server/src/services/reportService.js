import Payment from "../models/Payment.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

export const reportService = {
  async generateMonthly() {
    const month = new Date().getMonth() + 1;

    const payments = await Payment.find({ month }).populate("tenantId", "name");

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      type: "monthly",
      title: `Monthly Report - ${month}`,
      createdAt: new Date(),
      rawData: payments,
      total,
    };
  },

  async generateDateRange(from, to) {
    const payments = await Payment.find({
      createdAt: { $gte: new Date(from), $lte: new Date(to) },
    }).populate("tenantId", "name");

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      type: "range",
      title: `Report ${from} → ${to}`,
      createdAt: new Date(),
      rawData: payments,
      total,
    };
  },

  async generateFinancial({ from, to, expenses }) {
    const payments = await Payment.find({
      createdAt: { $gte: new Date(from), $lte: new Date(to) },
    });

    const income = payments.reduce((sum, p) => sum + p.amount, 0);
    const profit = income - expenses;

    return {
      type: "financial",
      title: `Financial Report ${from} → ${to}`,
      createdAt: new Date(),
      rawData: payments,
      income,
      expenses,
      profit,
    };
  },

  async generateCSV(data) {
    const parser = new Parser();
    return parser.parse(data.rawData);
  },

  async generatePDF(data) {
    const doc = new PDFDocument();
    const stream = new Readable({
      read() {}
    });

    doc.pipe(stream);

    doc.fontSize(20).text(data.title);
    doc.moveDown();

    data.rawData.forEach((item) => {
      doc.text(
        `${item.tenantId?.name || "N/A"} - $${item.amount} - Month ${item.month}`
      );
    });

    doc.end();
    return stream;
  },
};
