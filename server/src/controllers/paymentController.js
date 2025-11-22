import asyncHandler from "../middleware/asyncHandler.js";
import Payment from "../models/Payment.js";
import Tenant from "../models/Tenant.js";
import Unit from "../models/Unit.js";
import { generateReceipt } from "../utils/pdfReceipt.js";
import { sendReceiptEmail } from "../utils/email.js";

// CREATE PAYMENT + UPDATE TENANT + UPDATE UNIT + SEND RECEIPT
export const createPayment = asyncHandler(async (req, res) => {
  const { tenantId, amount, notes } = req.body;

  if (!tenantId || !amount) {
    return res.status(400).json({ message: "Tenant and amount required" });
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    return res.status(404).json({ message: "Tenant not found" });
  }

  // Only allow paying for tenant owned by current user
  if (String(tenant.userId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not authorized for this tenant" });
  }

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const payment = await Payment.create({
    tenantId,
    amount,
    date: now,
    month,
    notes,
    paid: true,
    userId: req.user._id,
  });

  // Update tenant
  tenant.rentPaid = true;
  tenant.lastPaymentDate = now;
  await tenant.save();

  // Update unit status if tenant is assigned
  if (tenant.unitId) {
    await Unit.findByIdAndUpdate(tenant.unitId, {
      status: "occupied",
      tenantId: tenant._id,
    });
  }

  // Generate receipt PDF
  const populatedPayment = await payment.populate("tenantId");
  const receiptPath = await generateReceipt(populatedPayment);

  payment.receiptUrl = receiptPath;
  await payment.save();

  // Send email receipt (non-blocking)
  try {
    await sendReceiptEmail(populatedPayment.tenantId.email, receiptPath);
  } catch (err) {
    console.error("Email sending failed:", err.message);
  }

  res.status(201).json(payment);
});

// GET /api/payments - only user's payments
export const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ userId: req.user._id }).populate("tenantId");
  res.json(payments);
});

// GET /api/payments/:id
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("tenantId");
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (String(payment.userId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not authorized to view this payment" });
  }

  res.json(payment);
});

// DELETE /api/payments/:id
export const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (String(payment.userId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not authorized to delete this payment" });
  }

  await payment.deleteOne();
  res.json({ message: "Payment removed" });
});
