import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Unit, Tenant, RentPayment } from "@/types/rental";
import { useAuth } from "@/contexts/AuthContext";

interface RentalContextType {
  units: Unit[];
  tenants: Tenant[];
  payments: RentPayment[];
  addUnit: (unit: Omit<Unit, "id">) => Promise<Unit>;
  updateUnit: (id: string, unit: Partial<Unit>) => Promise<Unit>;
  deleteUnit: (id: string) => Promise<void>;
  addTenant: (tenant: Omit<Tenant, "id">) => Promise<Tenant>;
  updateTenant: (id: string, tenant: Partial<Tenant>) => Promise<Tenant>;
  deleteTenant: (id: string) => Promise<void>;
  markRentPaid: (tenantId: string, amount: number, notes?: string) => Promise<void>;
  loadPayments: () => Promise<void>;
  resetAll: () => void;
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export const RentalProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth();

  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<RentPayment[]>([]);

  const API_URL = "http://localhost:5000/api";
  const API = import.meta.env.VITE_API_URL || API_URL;

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (!token) throw new Error("No authentication token found");
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
  };

  const resetAll = () => {
    setUnits([]);
    setTenants([]);
    setPayments([]);
  };

  // Load user-specific data
  const loadAll = async () => {
    try {
      const [unitsData, tenantsData, paymentsData] = await Promise.all([
        fetchWithAuth(`${API}/units`),
        fetchWithAuth(`${API}/tenants`),
        fetchWithAuth(`${API}/payments`),
      ]);

      setUnits(unitsData.map((u: any) => ({ ...u, id: String(u._id ?? u.id) })));
      setTenants(
        tenantsData.map((t: any) => ({
          ...t,
          id: String(t._id ?? t.id),
          unitId: t.unitId ? String(t.unitId._id ?? t.unitId) : undefined,
        }))
      );
      setPayments(paymentsData.map((p: any) => ({ ...p, id: String(p._id ?? p.id) })));
    } catch (err) {
      console.error("loadAll error:", err);
      resetAll(); // clear state if load fails
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) loadAll();
    else resetAll();
  }, [isAuthenticated, token]);

  // --- Units ---
  const addUnit = async (unit: Omit<Unit, "id">) => {
    const data = await fetchWithAuth(`${API}/units`, {
      method: "POST",
      body: JSON.stringify(unit),
    });
    const normalized = { ...data, id: String(data._id ?? data.id) };
    setUnits((prev) => [...prev, normalized]);
    return normalized;
  };

  const updateUnit = async (id: string, unit: Partial<Unit>) => {
    const data = await fetchWithAuth(`${API}/units/${id}`, {
      method: "PUT",
      body: JSON.stringify(unit),
    });
    const normalized = { ...data, id: String(data._id ?? data.id) };
    setUnits((prev) => prev.map((u) => (u.id === id ? normalized : u)));
    return normalized;
  };

  const deleteUnit = async (id: string) => {
    await fetchWithAuth(`${API}/units/${id}`, { method: "DELETE" });
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  // --- Tenants ---
  const addTenant = async (tenant: Omit<Tenant, "id">) => {
    const payload: any = { ...tenant };
    payload.unitId = payload.unitId ? String(payload.unitId) : undefined;

    const data = await fetchWithAuth(`${API}/tenants`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const normalized = {
      ...data,
      id: String(data._id ?? data.id),
      unitId: data.unitId ? String(data.unitId._id ?? data.unitId) : undefined,
    };
    setTenants((prev) => [...prev, normalized]);
    return normalized;
  };

  const updateTenant = async (id: string, tenant: Partial<Tenant>) => {
    const payload: any = { ...tenant };
    if ("unitId" in payload) payload.unitId = payload.unitId ? String(payload.unitId) : null;

    const data = await fetchWithAuth(`${API}/tenants/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const normalized = {
      ...data,
      id: String(data._id ?? data.id),
      unitId: data.unitId ? String(data.unitId._id ?? data.unitId) : undefined,
    };
    setTenants((prev) => prev.map((t) => (t.id === id ? normalized : t)));
    return normalized;
  };

  const deleteTenant = async (id: string) => {
    const tenant = tenants.find((t) => t.id === id);
    try {
      if (tenant?.unitId) await updateUnit(tenant.unitId, { tenantId: null, status: "vacant" });
      await fetchWithAuth(`${API}/tenants/${id}`, { method: "DELETE" });
      setTenants((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("deleteTenant error:", err);
      throw err;
    }
  };

  // --- Rent ---
  const markRentPaid = async (tenantId: string, amount: number, notes?: string) => {
    try {
      const payment = await fetchWithAuth(`${API}/payments`, {
        method: "POST",
        body: JSON.stringify({ tenantId, amount, notes }),
      });

      setPayments((prev) => [
        ...prev,
        {
          ...payment,
          id: String(payment._id ?? payment.id),
          tenantId: String(payment.tenantId._id ?? payment.tenantId),
        },
      ]);

      setTenants((prev) =>
        prev.map((t) =>
          t.id === tenantId
            ? { ...t, rentPaid: true, lastPaymentDate: payment.date }
            : t
        )
      );
    } catch (err) {
      console.error("markRentPaid error:", err);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await fetchWithAuth(`${API}/payments`);
      setPayments(data.map((p: any) => ({ ...p, id: String(p._id ?? p.id) })));
    } catch (err) {
      console.error("loadPayments error:", err);
    }
  };

  return (
    <RentalContext.Provider
      value={{
        units,
        tenants,
        payments,
        addUnit,
        updateUnit,
        deleteUnit,
        addTenant,
        updateTenant,
        deleteTenant,
        markRentPaid,
        loadPayments,
        resetAll,
      }}
    >
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) throw new Error("useRental must be used within RentalProvider");
  return context;
};
