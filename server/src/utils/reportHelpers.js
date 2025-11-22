import { createObjectCsvStringifier } from "csv-writer";
import PDFDocument from "pdfkit";
import streamBuffers from "stream-buffers";

// CSV GENERATOR
export async function createCSVBuffer(rows) {
  if (!rows || rows.length === 0) return Buffer.from("");

  const header = Object.keys(rows[0]).map((k) => ({ id: k, title: k }));
  const stringifier = createObjectCsvStringifier({ header });

  let csv = stringifier.getHeaderString();
  csv += stringifier.stringifyRecords(rows);

  return Buffer.from(csv, "utf8");
}

// PDF GENERATOR
export async function createPDFBuffer({ title = "Report", rows = [] }) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const bufferStream = new streamBuffers.WritableStreamBuffer();

  // IMPORTANT → pipe FIRST
  doc.pipe(bufferStream);

  // Title
  doc.fontSize(18).text(title, { align: "center" });
  doc.moveDown();

  const columns = rows[0] ? Object.keys(rows[0]) : [];
  const colWidth = Math.floor(
    (doc.page.width - doc.page.margins.left - doc.page.margins.right) /
      Math.max(1, columns.length)
  );

  // Header
  doc.fontSize(10).fillColor("#000");
  columns.forEach((c) =>
    doc.text(c.toUpperCase(), { continued: true, width: colWidth })
  );
  doc.moveDown(0.5);

  // Rows
  rows.forEach((r) => {
    columns.forEach((c) => {
      const txt =
        r[c] !== undefined && r[c] !== null ? String(r[c]) : "";
      doc.text(txt, { continued: true, width: colWidth });
    });
    doc.moveDown(0.2);
  });

  // Finalize PDF
  doc.end();

  return new Promise((resolve) => {
    bufferStream.on("finish", () => {
      resolve(bufferStream.getContents());
    });
  });
}
