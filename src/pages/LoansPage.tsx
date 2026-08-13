import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Loan, Area } from "../types";
import { loanApi, areaApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Plus, Search, ChevronRight } from "lucide-react";

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadLoans = async () => {
    setLoading(true);
    try {
      const areaList = await areaApi.getAreas();
      setAreas(areaList);

      const list = await loanApi.getLoans({ area_id: selectedAreaId || undefined });
      setLoans(list);
    } catch (err) {
      showToast("Failed to load loans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [selectedAreaId]);

  const filtered = loans.filter(
    (l) =>
      l.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      l.loan_number.toLowerCase().includes(search.toLowerCase()) ||
      l.loan_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loans Directory</h1>
          <p className="text-sm font-medium text-slate-500">Manage active loan accounts and schedules</p>
        </div>
        <Button onClick={() => navigate("/loans/new")} icon={<Plus size={18} />}>
          Create New Loan
        </Button>
      </div>

      <div className="grid gap-4 rounded-xl border border-sky-100 bg-white p-4 shadow-xs sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
          <Search className="text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search loan #, customer or ID..."
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
          <div className="py-12 text-center text-slate-500 font-medium">Loading loans...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">No loans found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Loan #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Total Payable</th>
                  <th className="px-4 py-3">EMI</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((l) => (
                  <tr key={l.loan_id} className="hover:bg-sky-50/40">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{l.loan_number}</td>
                    <td className="px-4 py-3.5 font-bold text-sky-800">{l.customer_name}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{l.area_name}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">₹{l.loan_amount.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">₹{l.total_payable.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">₹{l.emi_amount.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-600">{l.emi_type}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={l.status === "ACTIVE" ? "success" : l.status === "COMPLETED" ? "secondary" : "danger"}>
                        {l.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/loans/${l.loan_id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 hover:bg-sky-100"
                      >
                        Details <ChevronRight size={14} />
                      </Link>
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
