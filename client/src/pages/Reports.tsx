import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadBlob, downloadCSV } from "@/lib/download";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface Payment {
  tenant?: { firstName: string; lastName: string };
  unit?: { unitNumber: string };
  amount: number;
  createdAt: string;
}

interface Report {
  title: string;
  type: "monthly" | "range" | "financial";
  payments: Payment[];
  totalCollected?: number;
  netProfit?: number;
  createdAt: string;
}

function Reports() {
  const BASE_URL = "http://localhost:5000"; // backend
  const token = localStorage.getItem("token");

  const [reports, setReports] = useState<Report[]>([]);
  const [range, setRange] = useState({ from: "", to: "" });
  const [financialParams, setFinancialParams] = useState({ expenses: 0 });
  const [loadingReport, setLoadingReport] = useState({ monthly: false, range: false, financial: false });

  if (!token) {
    console.warn("No JWT token found. Please login first.");
  }

  // ===============================
  // Generate Reports
  // ===============================
  const generateReport = async (type: "monthly" | "range" | "financial") => {
    let url = `${BASE_URL}/api/reports/monthly`;
    let body: any = null;

    if (type === "range") {
      if (!range.from || !range.to) return toast.error("Please select both dates.");
      url = `${BASE_URL}/api/reports/range`;
      body = { from: range.from, to: range.to };
    }

    if (type === "financial") {
      if (!range.from || !range.to) return toast.error("Please select both dates.");
      url = `${BASE_URL}/api/reports/financial`;
      body = { from: range.from, to: range.to, expenses: financialParams.expenses };
    }

    try {
      setLoadingReport(prev => ({ ...prev, [type]: true }));

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.status === 401) throw new Error("Unauthorized. Please login.");
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to generate report");
      }

      const data: Report = await res.json();
      setReports(prev => [data, ...prev]);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to generate ${type} report: ${err.message}`);
    } finally {
      setLoadingReport(prev => ({ ...prev, [type]: false }));
    }
  };

  // ===============================
  // Download PDF
  // ===============================
  const handleDownloadPDF = async (report: Report) => {
    if (!report.payments || report.payments.length === 0) {
      return toast.error("No payments to generate PDF");
    }

    try {
      const res = await fetch(`${BASE_URL}/api/reports/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ payments: report.payments, title: report.title }),
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.title}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to download PDF");
    }
  };

  // ===============================
  // Download CSV
  // ===============================
  const handleDownloadCSV = (report: Report) => {
    if (!report.payments || report.payments.length === 0) {
      return toast.error("No payments to generate CSV");
    }

    try {
      downloadCSV(report.payments, report.title);
      toast.success("CSV downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download CSV");
    }
  };

  // ===============================
  // Chart Data
  // ===============================
  const chartData = useMemo(() => {
    return reports.map((r) => ({
      title: r.title,
      totalCollected: r.totalCollected ?? r.payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      netProfit: r.netProfit ?? null,
    }));
  }, [reports]);

  return (
    <Layout>
      <div className="space-y-10">
        <div className="p-6 rounded-xl bg-gradient-to-r from-[#0a1a2f] to-[#102544] text-white shadow-lg">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-white/80 mt-1 text-sm">Generate insights, export files, and analyze rental performance.</p>
        </div>

        {/* Generate Reports */}
        <Card className="shadow-md backdrop-blur bg-white/70 border">
          <CardHeader><CardTitle>Generate Reports</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <Button onClick={() => generateReport("monthly")} disabled={loadingReport.monthly}>{
                loadingReport.monthly ? "Generating..." : "Generate Monthly"
              }</Button>

              <input type="date" value={range.from} onChange={e => setRange({ ...range, from: e.target.value })} />
              <input type="date" value={range.to} onChange={e => setRange({ ...range, to: e.target.value })} />

              <Button onClick={() => generateReport("range")} disabled={loadingReport.range}>{
                loadingReport.range ? "Generating..." : "Generate Range"
              }</Button>

              <input type="number" value={financialParams.expenses} onChange={e => setFinancialParams({ ...financialParams, expenses: Number(e.target.value) })} placeholder="Expenses" />
              <Button onClick={() => generateReport("financial")} disabled={loadingReport.financial}>{
                loadingReport.financial ? "Generating..." : "Generate Financial"
              }</Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card className="shadow-md backdrop-blur bg-white/70 border">
          <CardHeader><CardTitle>Reports</CardTitle></CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p>No reports generated yet.</p>
            ) : (
              <div className="grid gap-4">
                {reports.map((r, idx) => (
                  <div key={idx} className="border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Generated {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(r)}>PDF</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadCSV(r)}>CSV</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        {chartData.length > 0 && (
          <Card className="shadow-md backdrop-blur bg-white/70 border">
            <CardHeader><CardTitle>Revenue Chart</CardTitle></CardHeader>
            <CardContent>
              <LineChart width={700} height={350} data={chartData}>
                <CartesianGrid stroke="#e5e7eb" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalCollected" stroke="#22c55e" name="Total Collected" />
                {chartData.some(r => r.netProfit !== null) && (
                  <Line type="monotone" dataKey="netProfit" stroke="#3b82f6" name="Net Profit" />
                )}
              </LineChart>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default Reports;
