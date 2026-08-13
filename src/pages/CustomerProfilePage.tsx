import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Customer, Loan } from "../types";
import { customerApi, loanApi } from "../api";
import { useToast } from "../components/Toast";
import { BackButton } from "../components/BackButton";
import { Badge } from "../components/Badge";
import { User, Phone, MapPin, Eye, EyeOff, Wallet } from "lucide-react";

export default function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealAadhaar, setRevealAadhaar] = useState(false);

  const { showToast } = useToast();

  const loadProfile = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const c = await customerApi.getCustomer(id);
      setCustomer(c);

      const custLoans = await loanApi.getLoans({ customer_id: id });
      setLoans(custLoans);
    } catch (err) {
      showToast("Failed to load customer profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  if (loading) return <div className="py-12 text-center text-slate-500 font-medium">Loading profile...</div>;
  if (!customer) return <div className="py-12 text-center text-slate-500 font-medium">Customer profile not found.</div>;

  const maskAadhaar = (aadhaarStr?: string) => {
    if (!aadhaarStr || aadhaarStr.length < 4) return "N/A";
    return `XXXX XXXX ${aadhaarStr.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{customer.customer_name}</h1>
          <p className="text-sm font-medium text-slate-500">Customer ID: {customer.customer_id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-sky-100 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="rounded-full bg-sky-100 p-3 text-sky-700">
              <User size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{customer.customer_name}</h2>
              <Badge variant={customer.status === "Active" ? "success" : "secondary"}>{customer.status}</Badge>
            </div>
          </div>

          <div className="space-y-2 text-xs font-semibold text-slate-700">
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" /> {customer.mobile_number}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={14} className="text-slate-400" /> {customer.address || "N/A"}
            </p>
            <p>Assigned Zone: <span className="font-bold text-sky-800">{customer.area_name}</span></p>
            
            <div className="pt-2 border-t border-slate-100">
              <p className="text-slate-400 uppercase">Aadhaar (Protected)</p>
              <div className="flex items-center gap-2 font-mono text-slate-900">
                <span>{revealAadhaar ? customer.aadhaar_number : maskAadhaar(customer.aadhaar_number)}</span>
                {customer.aadhaar_number && (
                  <button onClick={() => setRevealAadhaar(!revealAadhaar)} className="text-slate-400 hover:text-sky-600">
                    {revealAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>

            {customer.guarantor_name && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <p className="text-slate-400 uppercase">Guarantor Info</p>
                <p>{customer.guarantor_name} ({customer.guarantor_mobile || "N/A"})</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 rounded-xl border border-sky-100 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Associated Loan Accounts</h3>
          {loans.length === 0 ? (
            <p className="text-sm text-slate-500 font-medium py-6 text-center">No active loans for this customer.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Loan #</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Total Payable</th>
                    <th className="px-3 py-2">Outstanding</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((l) => (
                    <tr key={l.loan_id}>
                      <td className="px-3 py-2 font-bold text-sky-800">
                        <Link to={`/loans/${l.loan_id}`} className="hover:underline">{l.loan_number}</Link>
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-800">₹{l.loan_amount.toLocaleString()}</td>
                      <td className="px-3 py-2 font-bold text-slate-900">₹{l.total_payable.toLocaleString()}</td>
                      <td className="px-3 py-2 font-bold text-amber-600">₹{(l.outstanding || 0).toLocaleString()}</td>
                      <td className="px-3 py-2"><Badge variant={l.status === "ACTIVE" ? "success" : "secondary"}>{l.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
