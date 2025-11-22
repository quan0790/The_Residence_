import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { API } from "@/lib/api"; // Use the fixed API instance

export type SettingsForm = {
  fullName: string;
  email: string;
  businessName: string;
  address: string;
  phone: string;
  currency: string;
  defaultCurrency: string;
  currencies?: { code: string; label: string }[];
  timezone: string;
  defaultLateFee: string;
  paymentGracePeriod: string;
  emailReminders: boolean;
  smsReminders: boolean;
  systemMode: "A" | "B" | "C" | "D" | "E";
};

type SettingsContextType = {
  settings: SettingsForm;
  updateSettings: (newSettings: Partial<SettingsForm>) => Promise<void>;
  resetSettings: () => Promise<void>;
  loading: boolean;
};

export const EMPTY_SETTINGS: SettingsForm = {
  fullName: "",
  email: "",
  businessName: "",
  address: "",
  phone: "",
  currency: "USD",
  defaultCurrency: "USD",
  timezone: "UTC",
  defaultLateFee: "0",
  paymentGracePeriod: "3",
  emailReminders: false,
  smsReminders: false,
  systemMode: "A",
};

const SettingsContext = createContext<SettingsContextType>({
  settings: EMPTY_SETTINGS,
  updateSettings: async () => {},
  resetSettings: async () => {},
  loading: true,
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SettingsForm>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load from backend using API instance
  useEffect(() => {
    async function load() {
      try {
        const res = await API.get("/Settings");
        setSettings(res.data);
      } catch (err) {
        toast.error("Failed to load settings");
      }
      setLoading(false);
    }
    load();
  }, []);

  // Update settings on backend
  const updateSettings = async (newSettings: Partial<SettingsForm>) => {
    try {
      const payload = { ...settings, ...newSettings };
      const res = await API.put("/Settings", payload);
      setSettings(res.data);
      toast.success("Settings updated");
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  // Reset user settings on backend
  const resetSettings = async () => {
    try {
      const res = await API.put("/settings", EMPTY_SETTINGS);
      setSettings(res.data);
      toast.success("Settings reset");
    } catch (err) {
      toast.error("Failed to reset settings");
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
