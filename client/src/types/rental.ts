export interface Unit {
  id: string;
  unitNumber: string;
  type: string;
  rentAmount: number;
  status: "occupied" | "vacant";
  tenantId?: string;
  currency?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitId: string;
  rentDueDate: number; // day of month (1-31)
  rentPaid: boolean;
  lastPaymentDate?: string;
}

export interface RentPayment {
  id: string;
  tenantId: string;
  amount: number;
  date: string;        // ISO string
  month: string;       // YYYY-MM format
  receiptUrl?: string;
  paid?: boolean;      // added
  notes?: string;      // added
}
