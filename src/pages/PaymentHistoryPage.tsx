import React, { useState, useEffect } from "react";
import type { Payment, Area } from "../types";
import { paymentApi, areaApi, pdfApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Search, Download, Printer } from "lucide-react";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const loadPayments = async () => {
    setLoading(true);
    try {
      const areaList = await areaApi.getAreas();
      setAreas(areaList);

      const list = await paymentApi.getPayments({ area_id: selectedAreaId || undefined });
      setPayments(list);
    } catch (err) {
      showToast("Failed to load payment history", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [selectedAreaId]);

  const filtered = payments.filter(
    (p) =>
      p.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      p.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
      p.loan_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Collection History</h1>
          <p className="text-sm font-medium text-slate-500">View and print past receipts</p>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-sky-100 bg-white p-4 shadow-xs sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
          <Search className="text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search receipt #, customer or loan ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-slate-500 shrink-0">Area Filter:</label>
          <select
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none"
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a.area_id} value={a.area_id}>
                {a.area_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading payment history...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Receipt #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Paid Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Collector</th>
                  <th className="px-4 py-3 text-right">PDF Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-sky-50/40">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{p.receipt_number}</td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600">{p.payment_date.slice(0, 10)}</td>
                    <td className="px-4 py-3.5 font-bold text-sky-800">{p.customer_name}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{p.area_name}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">₹{p.amount_paid.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-600">{p.payment_method}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{p.collected_by}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Printer size={14} />}
                        onClick={() => pdfApi.downloadReceipt(p.receipt_number)}
                      >
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
