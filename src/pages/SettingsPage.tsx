import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { useToast } from "../components/Toast";

const key = "loan_demo_settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState({ businessName: "ABC Finance", businessAddress: "Main Road, Hyderabad", mobile: "9876500000", footer: "Thank you for your payment.", currency: "INR", dateFormat: "DD MMM YYYY" });
  const { showToast } = useToast();
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) setSettings(JSON.parse(saved) as typeof settings);
  }, []);
  const update = (field: keyof typeof settings, value: string) => setSettings((current) => ({ ...current, [field]: value }));
  const save = () => {
    localStorage.setItem(key, JSON.stringify(settings));
    showToast("Settings saved successfully.");
  };
  return (
    <div className="grid gap-6">
      <div><h1 className="text-2xl font-black text-slate-950">Settings</h1><p className="text-sm font-semibold text-slate-500">Theme is fixed as Light Blue + White.</p></div>
      <section className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Business Information</h2>
        <div className="grid gap-4 md:grid-cols-2"><Input label="Business Name" value={settings.businessName} onChange={(event) => update("businessName", event.target.value)} /><Input label="Mobile Number" value={settings.mobile} onChange={(event) => update("mobile", event.target.value)} /><Input label="Business Address" value={settings.businessAddress} onChange={(event) => update("businessAddress", event.target.value)} /></div>
      </section>
      <section className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Receipt Settings</h2>
        <Input label="Receipt Footer" value={settings.footer} onChange={(event) => update("footer", event.target.value)} />
      </section>
      <section className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">System Settings</h2>
        <div className="grid gap-4 md:grid-cols-2"><Select label="Currency" value={settings.currency} onChange={(event) => update("currency", event.target.value)} options={["INR"]} /><Select label="Date Format" value={settings.dateFormat} onChange={(event) => update("dateFormat", event.target.value)} options={["DD MMM YYYY", "DD/MM/YYYY"]} /></div>
      </section>
      <section className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-slate-900">Appearance</h2><p className="mt-2 text-sm font-semibold text-slate-600">Light Blue + White</p></section>
      <div className="flex justify-end"><Button icon={<Save size={18} />} onClick={save}>Save Settings</Button></div>
    </div>
  );
}
