import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateReceipt = (payment) => {
  return new Promise((resolve, reject) => {
    const receiptDir = path.join(process.cwd(), "receipts");
    if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir);

    const filePath = path.join(receiptDir, `receipt-${payment._id}.pdf`);
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text("Rent Payment Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Tenant: ${payment.tenantId.name}`);
    doc.text(`Unit: ${payment.tenantId.unitNumber || "N/A"}`);
    doc.text(`Unit Type: ${payment.tenantId.unitType || "N/A"}`);
    doc.text(`Amount Paid: $${payment.amount.toFixed(2)}`);
    doc.text(`Payment Date: ${payment.date.toDateString()}`);
    if (payment.notes) doc.text(`Notes: ${payment.notes}`);
    doc.moveDown();
    doc.text("Thank you for your payment!", { align: "center" });

    doc.end();
    doc.on("finish", () => resolve(filePath));
    doc.on("error", (err) => reject(err));
  });
};
