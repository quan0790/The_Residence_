import Payment from "../models/Payment.js";
import Tenant from "../models/Tenant.js";

export const paymentService = {
  async createPayment(data) {
    const tenant = await Tenant.findById(data.tenantId);
    if (!tenant) throw new Error("Tenant not found");

    const payment = await Payment.create({
      tenantId: data.tenantId,
      amount: data.amount,
      month: data.month,
      method: data.method,
      receiptUrl: data.receiptUrl || null,
      status: "paid",
    });

    return payment;
  },

  async getPayments(query = {}) {
    return Payment.find(query).populate("tenantId", "name unit");
  },

  async updatePayment(id, updates) {
    const payment = await Payment.findByIdAndUpdate(id, updates, { new: true });
    if (!payment) throw new Error("Payment not found");
    return payment;
  },

  async deletePayment(id) {
    const res = await Payment.findByIdAndDelete(id);
    if (!res) throw new Error("Payment not found");
    return true;
  },

  // 🔥 Overdue Rent
  async getOverdueRent() {
    const allTenants = await Tenant.find();

    const overdue = [];

    for (const tenant of allTenants) {
      const lastPayment = await Payment.findOne({ tenantId: tenant._id })
        .sort({ createdAt: -1 });

      const paidMonth = lastPayment?.month || 0;
      const currentMonth = new Date().getMonth() + 1;

      if (paidMonth < currentMonth) {
        overdue.push({
          tenant: tenant.name,
          unit: tenant.unit,
          lastPaidMonth: paidMonth,
          overdueMonths: currentMonth - paidMonth,
        });
      }
    }

    return overdue;
  },
};
