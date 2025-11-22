import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useSettings, SettingsForm } from "@/contexts/SettingsContext";
import { toast } from "sonner";

const CURRENCY_OPTIONS = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "KES", label: "Kenyan Shilling" },
];

const TIMEZONE_OPTIONS = [
  "UTC",
  "Africa/Nairobi",
  "America/New_York",
];

const SYSTEM_MODES: SettingsForm["systemMode"][] = ["A", "B", "C", "D", "E"];

const SettingsPage = () => {
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState<SettingsForm>(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "defaultLateFee" || name === "paymentGracePeriod"
          ? Number(value)
          : value,
    }));
  };

  const handleSwitchChange = (
    name: keyof Pick<SettingsForm, "emailReminders" | "smsReminders">,
    value: boolean
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveSettings = () => {
    try {
      updateSettings({
        ...form,
        defaultCurrency: form.currency, // Ensure defaultCurrency is updated
      });
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    }
  };

  return (
    <Layout>
      <div className="space-y-10">
        {/* HEADER */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-[#0a1a2f] to-[#102544] text-white shadow-lg">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-white/80 mt-1 text-sm">
            Update your system preferences and profile information.
          </p>
        </div>

        {/* PROFILE */}
        <Card className="shadow-md backdrop-blur bg-white/70 border">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* BUSINESS */}
        <Card className="shadow-md backdrop-blur bg-white/70 border">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                placeholder="Rental Hub LLC"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Main St"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 555 123 4567"
              />
            </div>
          </CardContent>
        </Card>

        {/* SYSTEM SETTINGS */}
        <Card className="shadow-md backdrop-blur bg-white/70 border">
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full p-3 bg-white border rounded-lg"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                name="timezone"
                value={form.timezone}
                onChange={handleChange}
                className="w-full p-3 bg-white border rounded-lg"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.split("/").join(" — ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="systemMode">System Mode</Label>
              <select
                id="systemMode"
                name="systemMode"
                value={form.systemMode}
                onChange={handleChange}
                className="w-full p-3 bg-white border rounded-lg"
              >
                {SYSTEM_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    Mode {mode}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* PAYMENT */}
        <Card className="shadow-md backdrop-blur bg-white/70 border">
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultLateFee">
                Default Late Fee ({form.currency})
              </Label>
              <Input
                id="defaultLateFee"
                name="defaultLateFee"
                value={form.defaultLateFee}
                onChange={handleChange}
                type="number"
              />
            </div>
            <div>
              <Label htmlFor="paymentGracePeriod">Payment Grace Period (days)</Label>
              <Input
                id="paymentGracePeriod"
                name="paymentGracePeriod"
                value={form.paymentGracePeriod}
                onChange={handleChange}
                type="number"
              />
            </div>
          </CardContent>
        </Card>

        {/* NOTIFICATIONS */}
        <Card className="shadow-md backdrop-blur bg-white/70 border">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Email Reminders</Label>
              <Switch
                checked={form.emailReminders}
                onCheckedChange={(val) => handleSwitchChange("emailReminders", val)}
              />
            </div>
            <div className="flex justify-between items-center">
              <Label>SMS Reminders</Label>
              <Switch
                checked={form.smsReminders}
                onCheckedChange={(val) => handleSwitchChange("smsReminders", val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* SAVE BUTTON */}
        <Button
          size="lg"
          onClick={saveSettings}
          className="
            w-full font-semibold text-white 
            bg-gradient-to-r from-[#0a75ff] to-[#0053cc]
            rounded-2xl shadow-lg 
            hover:shadow-xl hover:scale-[1.03] 
            active:scale-[0.98]
            transition-all duration-200
            flex items-center justify-center gap-2
          "
        >
          <Save className="h-5 w-5" />
          Save All Settings
        </Button>
      </div>
    </Layout>
  );
};

export default SettingsPage;
