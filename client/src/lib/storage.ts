import { Unit, Tenant, RentPayment } from '@/types/rental';

const STORAGE_KEYS = {
  UNITS: 'rental_units',
  TENANTS: 'rental_tenants',
  PAYMENTS: 'rental_payments',
  AUTH: 'rental_auth',
};

export const storage = {
  // Units
  getUnits: (): Unit[] => {
    const data = localStorage.getItem(STORAGE_KEYS.UNITS);
    return data ? JSON.parse(data) : [];
  },
  
  saveUnits: (units: Unit[]) => {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  },

  // Tenants
  getTenants: (): Tenant[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TENANTS);
    return data ? JSON.parse(data) : [];
  },
  
  saveTenants: (tenants: Tenant[]) => {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  },

  // Payments
  getPayments: (): RentPayment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data) : [];
  },
  
  savePayments: (payments: RentPayment[]) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  },

  // Auth
  getAuth: (): { isAuthenticated: boolean } => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH);
    return data ? JSON.parse(data) : { isAuthenticated: false };
  },
  
  saveAuth: (auth: { isAuthenticated: boolean }) => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
  },
  
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },
};
