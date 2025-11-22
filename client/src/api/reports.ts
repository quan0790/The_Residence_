const API = "http://localhost:5000/api";

// Fetch all saved reports
export const fetchReports = async () => {
  const res = await fetch(`${API}/reports`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
};

// Generate monthly report
export const generateMonthly = async () => {
  const res = await fetch(`${API}/reports/monthly`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to generate monthly report");
  return res.json();
};

// Generate report by date range
export const generateDateRange = async (range: { from: string; to: string }) => {
  const res = await fetch(`${API}/reports/range`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(range),
  });
  if (!res.ok) throw new Error("Failed to generate date-range report");
  return res.json();
};

// Generate financial report
export const generateFinancial = async (params: { from: string; to: string; expenses: number }) => {
  const res = await fetch(`${API}/reports/financial`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to generate financial report");
  return res.json();
};
