// routes/emailRoutes.js
import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import { sendEmail } from "../utils/email.js"; // your nodemailer function

const router = express.Router();

// POST /api/send-email
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      res.status(400);
      throw new Error("Missing email parameters");
    }

    const html = `<p>${body.replace(/\n/g, "<br>")}</p>`; // simple line breaks to HTML
    await sendEmail({ to, subject, html });

    res.json({ message: "Email sent successfully" });
  })
);

export default router;
