import { Save, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAppData } from "../context/AppDataContext";
import { customerService } from "../services/customerService";
import { useToast } from "../components/Toast";

export default function AddCustomerPage() {
  const navigate = useNavigate();
  const { refresh } = useAppData();
  const { showToast } = useToast();
  const [photoUrl, setPhotoUrl] = useState("");
  const [form, setForm] = useState({
    name: "", mobile: "", alternateMobile: "", address: "", aadhaar: "", occupation: "", guarantorName: "", guarantorMobile: "", guarantorAddress: "", guarantorAadhaar: "", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!/^\d{10}$/.test(form.mobile)) nextErrors.mobile = "Mobile must be 10 digits";
    if (form.aadhaar && !/^\d{12}$/.test(form.aadhaar)) nextErrors.aadhaar = "Aadhaar must be 12 digits";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    await customerService.create({
      name: form.name,
      mobile: form.mobile,
      alternateMobile: form.alternateMobile,
      address: form.address,
      aadhaar: form.aadhaar,
      occupation: form.occupation,
      photoUrl,
      guarantor: { name: form.guarantorName, mobile: form.guarantorMobile, address: form.guarantorAddress, aadhaar: form.guarantorAadhaar },
      notes: form.notes,
    });
    await refresh();
    showToast("Customer created successfully.");
    navigate("/customers");
  };

  const upload = (file?: File) => {
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={submit} className="grid gap-6">
      <div><h1 className="text-2xl font-black text-slate-950">Add Customer</h1><p className="text-sm font-semibold text-slate-500">Customer information is stored in local demo state only.</p></div>
      <section className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Customer Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Customer Name *" value={form.name} onChange={(event) => update("name", event.target.value)} error={errors.name} />
          <Input label="Mobile Number *" value={form.mobile} onChange={(event) => update("mobile", event.target.value)} error={errors.mobile} />
          <Input label="Alternate Mobile" value={form.alternateMobile} onChange={(event) => update("alternateMobile", event.target.value)} />
          <Input label="Aadhaar Number" value={form.aadhaar} onChange={(event) => update("aadhaar", event.target.value)} error={errors.aadhaar} />
          <Input label="Occupation" value={form.occupation} onChange={(event) => update("occupation", event.target.value)} />
          <label className="grid gap-1.5 text-sm font-medium text-slate-700"><span>Photo Upload</span><input type="file" accept="image/*" onChange={(event) => upload(event.target.files?.[0])} className="rounded-md border border-sky-100 bg-white px-3 py-2" /></label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700 md:col-span-2"><span>Address</span><textarea value={form.address} onChange={(event) => update("address", event.target.value)} className="min-h-24 rounded-md border border-sky-100 bg-white px-3 py-2" /></label>
        </div>
        {photoUrl ? <img src={photoUrl} alt="Customer preview" className="mt-4 h-24 w-24 rounded-md object-cover" /> : null}
      </section>
      <section className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Guarantor Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Guarantor Name" value={form.guarantorName} onChange={(event) => update("guarantorName", event.target.value)} />
          <Input label="Guarantor Mobile" value={form.guarantorMobile} onChange={(event) => update("guarantorMobile", event.target.value)} />
          <Input label="Guarantor Aadhaar" value={form.guarantorAadhaar} onChange={(event) => update("guarantorAadhaar", event.target.value)} />
          <Input label="Guarantor Address" value={form.guarantorAddress} onChange={(event) => update("guarantorAddress", event.target.value)} />
          <label className="grid gap-1.5 text-sm font-medium text-slate-700 md:col-span-2"><span>Notes</span><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} className="min-h-24 rounded-md border border-sky-100 bg-white px-3 py-2" /></label>
        </div>
      </section>
      <div className="flex justify-end gap-3"><Button type="button" variant="secondary" icon={<X size={18} />} onClick={() => navigate("/customers")}>Cancel</Button><Button type="submit" icon={<Save size={18} />}>Save Customer</Button></div>
    </form>
  );
}
