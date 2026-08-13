import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Customer, Area } from "../types";
import { customerApi, areaApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Plus, Search, Eye, EyeOff, UserCheck, Phone, MapPin, ChevronRight, Trash2 } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [revealedAadhaarMap, setRevealedAadhaarMap] = useState<Record<string, boolean>>({});

  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const areaList = await areaApi.getAreas();
      setAreas(areaList);

      const custs = await customerApi.getCustomers({
        area_id: selectedAreaId || undefined,
        search: search || undefined,
      });
      setCustomers(custs);
    } catch (err) {
      showToast("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedAreaId, search]);

  const toggleAadhaarReveal = (custId: string) => {
    setRevealedAadhaarMap((prev) => ({
      ...prev,
      [custId]: !prev[custId],
    }));
  };

  const maskAadhaar = (aadhaarStr?: string) => {
    if (!aadhaarStr || aadhaarStr.length < 4) return "N/A";
    const last4 = aadhaarStr.slice(-4);
    return `XXXX XXXX ${last4}`;
  };

  const handleDelete = async (custId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer '${name}'?`)) return;
    try {
      await customerApi.deleteCustomer(custId);
      showToast(`Customer '${name}' deleted successfully`, "success");
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Delete failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Directory</h1>
          <p className="text-sm font-medium text-slate-500">Manage registered borrowers and area links</p>
        </div>
        <Button onClick={() => navigate("/customers/new")} icon={<Plus size={18} />}>
          Add Customer
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid gap-4 rounded-xl border border-sky-100 bg-white p-4 shadow-xs sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
          <Search className="text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search customer name, mobile or ID..."
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
                {a.area_name} ({a.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Customer ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Aadhaar (Protected)</th>
                  <th className="px-4 py-3">Active Loans</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const isRevealed = revealedAadhaarMap[c.customer_id];
                  const displayAadhaar = isRevealed ? c.aadhaar_number : maskAadhaar(c.aadhaar_number);

                  return (
                    <tr key={c.customer_id} className="hover:bg-sky-50/40">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{c.customer_id}</td>
                      <td className="px-4 py-3.5 font-bold text-sky-800">
                        <Link to={`/customers/${c.customer_id}`} className="hover:underline">
                          {c.customer_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-600">{c.mobile_number}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">{c.area_name}</td>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-2">
                          <span>{displayAadhaar || "N/A"}</span>
                          {c.aadhaar_number && (
                            <button
                              onClick={() => toggleAadhaarReveal(c.customer_id)}
                              className="text-slate-400 hover:text-sky-600"
                              title={isRevealed ? "Mask Aadhaar" : "Reveal Aadhaar"}
                            >
                              {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">{c.active_loans_count || 0}</td>
                      <td className="px-4 py-3.5 font-bold text-amber-600">
                        ₹{(c.total_outstanding || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/customers/${c.customer_id}`}
                            className="rounded-md bg-sky-50 p-1.5 text-sky-700 hover:bg-sky-100"
                          >
                            <ChevronRight size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(c.customer_id, c.customer_name)}
                            className="rounded-md bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                            title="Delete Customer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
