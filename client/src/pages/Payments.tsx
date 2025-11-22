import React, { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Plus, X, Search } from "lucide-react";
import { useRental } from "@/contexts/RentalContext";
import { useSettings } from "@/contexts/SettingsContext";
import { downloadCSV } from "@/lib/csv";
import { motion, AnimatePresence } from "framer-motion";
import { RentPayment, Tenant, Unit } from "@/types/rental";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const CURRENCIES = [
  { code: "USD", label: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", label: "Euro", flag: "🇪🇺" },
  { code: "GBP", label: "British Pound", flag: "🇬🇧" },
  { code: "CAD", label: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", label: "Australian Dollar", flag: "🇦🇺" },
  { code: "NGN", label: "Nigerian Naira", flag: "🇳🇬" },
  { code: "KES", label: "Kenyan Shilling", flag: "🇰🇪" },
  { code: "GHS", label: "Ghanaian Cedi", flag: "🇬🇭" },
  { code: "ZAR", label: "South African Rand", flag: "🇿🇦" },
  { code: "INR", label: "Indian Rupee", flag: "🇮🇳" },
  { code: "JPY", label: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", label: "Chinese Yuan", flag: "🇨🇳" },
  { code: "BRL", label: "Brazilian Real", flag: "🇧🇷" }
];

function Payments() {
  const { payments, tenants, units, markRentPaid, loadPayments } = useRental();
  const { settings } = useSettings();

  const [currency, setCurrency] = useState<string>(settings.currency ?? "KES");
  const [timezone, setTimezone] = useState<string>(settings.timezone ?? "Africa/Nairobi");

  const [search, setSearch] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [page, setPage] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    setCurrency(settings.currency);
    setTimezone(settings.timezone);
  }, [settings]);

  const enhanced = useMemo(() => {
    return payments.map((p: RentPayment & any) => {
      const tenant: Tenant =
        tenants.find((t) => t.id === p.tenantId) ?? {
          id: "",
          name: "Unknown",
          email: "",
          phone: "",
          unitId: "",
          rentDueDate: 1,
          rentPaid: false,
          lastPaymentDate: undefined,
        };

      const unit: Unit =
        units.find((u) => u.id === (tenant?.unitId ?? p.unitId)) ?? {
          id: "",
          unitNumber: "N/A",
          type: "",
          rentAmount: 0,
          status: "vacant",
          tenantId: "",
          currency: undefined,
        };

      const monthName = p.month
        ? MONTHS[Number(p.month.split("-")[1]) - 1] ?? "Unknown"
        : "Unknown";

      return {
        ...p,
        tenantName: tenant.name ?? "Unknown",
        unitNumber: unit.unitNumber ?? "N/A",
        monthName,
        paid: p.paid ?? false, // default unpaid
      };
    });
  }, [payments, tenants, units]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return enhanced.filter((p) => {
      const matchesSearch =
        !s ||
        p.tenantName.toLowerCase().includes(s) ||
        p.unitNumber.toLowerCase().includes(s) ||
        p.monthName.toLowerCase().includes(s);

      const matchesMonth = monthFilter ? p.monthName === monthFilter : true;
      return matchesSearch && matchesMonth;
    });
  }, [enhanced, search, monthFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "amount-high") return (b.amount ?? 0) - (a.amount ?? 0);
      if (sortBy === "amount-low") return (a.amount ?? 0) - (b.amount ?? 0);
      return 0;
    });
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const formatMoney = (amount: number) => {
    const curr = CURRENCIES.find((c) => c.code === currency);
    try {
      return `${curr?.flag ?? ""} ${new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency,
      }).format(amount)}`;
    } catch {
      return `${curr?.flag ?? ""} ${amount.toFixed(2)}`;
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleString("en-KE", { timeZone: timezone }) : "-";

  const exportPayments = () => {
    const rows = enhanced.map((p) => ({
      Date: formatDate(p.date),
      Month: p.monthName,
      Tenant: p.tenantName,
      Unit: p.unitNumber,
      Amount: p.amount,
      Paid: p.paid ? "Yes" : "No",
      Receipt: p.receiptUrl ?? "",
      Notes: p.notes ?? "",
    }));
    downloadCSV(rows, "payments");
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const tenantId = String(form.get("tenantId") ?? "");
    const amount = Number(form.get("amount") ?? 0);
    const notes = String(form.get("notes") ?? "");

    if (!tenantId || amount <= 0) {
      alert("Invalid tenant or amount");
      return;
    }

    try {
      await markRentPaid(tenantId, amount, notes);
      await loadPayments();
      e.currentTarget.reset();
      setModalOpen(false);
    } catch (err: any) {
      alert(err?.message ?? "Failed to add payment");
    }
  };

  const totalCollected = enhanced.reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <Layout>
      <>
        {/* Total */}
        <Card className="mb-6 bg-[#10233F] border border-white/10 text-white shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Total Collected This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold">{formatMoney(totalCollected)}</p>
          </CardContent>
        </Card>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-[#10233F] p-4 rounded-xl shadow border border-white/10 text-white">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-300" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search tenant, unit, or month..."
              className="pl-10 p-2 bg-[#0A1A2F] border border-white/20 rounded-lg w-64 text-white placeholder-gray-300"
            />
          </div>

          <select
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
            className="p-2 bg-[#0A1A2F] border border-white/20 rounded-lg text-white"
          >
            <option value="">All Months</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 bg-[#0A1A2F] border border-white/20 rounded-lg text-white"
          >
            <option value="newest">Newest → Oldest</option>
            <option value="oldest">Oldest → Newest</option>
            <option value="amount-high">Amount High → Low</option>
            <option value="amount-low">Amount Low → High</option>
          </select>

          <Button onClick={exportPayments} variant="outline" className="rounded-lg bg-white text-black border border-gray-300 shadow-sm">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>

          <Button className="rounded-lg bg-blue-600 hover:bg-blue-700" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Payment
          </Button>
        </div>

        {/* Payments */}
        <Card className="rounded-2xl border border-white/10 bg-[#10233F] text-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payments</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <AnimatePresence>
              {paged.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#0A1A2F] border border-white/10"
                >
                  <div>
                    <p className="font-semibold">{p.tenantName}</p>
                    <p className="text-xs text-gray-300">
                      Unit {p.unitNumber} • {p.monthName}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatDate(p.date)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-400">
                      {formatMoney(p.amount ?? 0)}
                    </span>

                    {p.paid ? (
                      <span className="text-xs bg-green-600 px-2 py-1 rounded-full text-white">
                        Paid
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await markRentPaid(p.tenantId, p.amount ?? 0, "Marked paid manually");
                            await loadPayments();
                          } catch (err: any) {
                            alert(err?.message ?? "Failed to mark payment as paid");
                          }
                        }}
                      >
                        Mark as Paid
                      </Button>
                    )}

                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {paged.length === 0 && (
              <p className="text-sm text-gray-400">No matching payments.</p>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-center gap-3 mt-5">
          <Button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg bg-[#0A1A2F] border border-white/20 text-white"
          >
            Prev
          </Button>

          <div className="px-3 py-2 text-white">
            Page {page} / {totalPages}
          </div>

          <Button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg bg-[#0A1A2F] border border-white/20 text-white"
          >
            Next
          </Button>
        </div>

        {/* Add Payment Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#10233F] p-6 rounded-2xl w-96 border border-white/20 text-white shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">New Payment</h2>
                <button onClick={() => setModalOpen(false)}>
                  <X className="h-5 w-5 text-gray-300" />
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="space-y-4">
                <select
                  name="tenantId"
                  required
                  className="w-full p-3 bg-[#0A1A2F] border border-white/20 rounded-lg text-white"
                >
                  <option value="">Select Tenant</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <input
                  name="amount"
                  type="number"
                  min={1}
                  required
                  placeholder="Amount"
                  className="w-full p-3 bg-[#0A1A2F] border border-white/20 rounded-lg text-white"
                />

                <textarea
                  name="notes"
                  placeholder="Notes (optional)"
                  className="w-full p-3 bg-[#0A1A2F] border border-white/20 rounded-lg text-white"
                />

                <Button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-3 text-md"
                >
                  Add Payment
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </>
    </Layout>
  );
}

export default Payments;
