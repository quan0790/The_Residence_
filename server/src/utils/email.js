import fs from "fs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReceiptEmail(to, filePath) {
  // Read your receipt PDF from file system
  const fileContent = fs.readFileSync(filePath, { encoding: "base64" });

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [to],
    subject: "Your Rent Payment Receipt",
    html: `<p>Thank you for your payment. Please find your receipt attached.</p>`,
    attachments: [
      {
        content: fileContent,
        filename: "receipt.pdf",
      },
    ],
  });

  if (error) {
    console.error("Resend email error:", error);
    throw error;
  }

  console.log("Resend email sent, id:", data.id);
  return data.id;
}
