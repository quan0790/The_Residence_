import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    month: {
      type: String,
      required: true,
    },
    notes: { type: String },
    receiptUrl: { type: String },
    paid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
