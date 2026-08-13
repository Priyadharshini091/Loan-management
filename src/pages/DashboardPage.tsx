import React, { useState, useEffect } from "react";
import type { Area, DashboardStats } from "../types";
import { areaApi, dashboardApi } from "../api";
import { StatCard } from "../components/StatCard";
import { Users, Wallet, CreditCard, Clock, AlertTriangle, CheckCircle2, MapPin, ChevronDown } from "lucide-react";

export default function DashboardPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>(""); // "" = All Areas
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (areaId: string) => {
    setLoading(true);
    try {
      const areaList = await areaApi.getAreas();
      setAreas(areaList);

      const res = await dashboardApi.getDashboard(areaId || undefined);
      setStats(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedAreaId);
  }, [selectedAreaId]);

  return (
    <div className="space-y-6">
      {/* Top Bar Banner with Area Filter */}
      <div className="flex flex-col gap-4 rounded-xl border border-sky-100 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Main Dashboard</h1>
          <p className="text-sm font-medium text-slate-500">
            Overall business overview & performance analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
            <MapPin size={14} className="text-sky-600" /> Filter Area:
          </label>
          <div className="relative">
            <select
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              className="appearance-none rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 pr-10 text-sm font-bold text-sky-900 shadow-xs focus:border-sky-500 focus:outline-none"
            >
              <option value="">All Areas (Overall)</option>
              {areas.map((a) => (
                <option key={a.area_id} value={a.area_id}>
                  {a.area_name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-2.5 text-sky-600" size={16} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">Loading dashboard statistics...</div>
      ) : stats ? (
        <>
          {/* Main Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Customers" value={stats.total_customers} icon={<Users size={22} />} />
            <StatCard title="Total Active Loans" value={stats.active_loans} icon={<Wallet size={22} />} />
            <StatCard
              title="Total Loan Given"
              value={`₹${stats.total_loan_given.toLocaleString("en-IN")}`}
              icon={<CreditCard size={22} />}
            />
            <StatCard
              title="Today's Collection"
              value={`₹${stats.collection_today.toLocaleString("en-IN")}`}
              icon={<CheckCircle2 size={22} />}
            />
            <StatCard
              title="Total Pending"
              value={`₹${stats.pending_amount.toLocaleString("en-IN")}`}
              icon={<Clock size={22} />}
            />
            <StatCard
              title="Overdue Customers"
              value={stats.overdue_customers}
              icon={<AlertTriangle size={22} />}
            />
          </div>

          {/* Area Breakdown Summaries */}
          {stats.area_summaries && stats.area_summaries.length > 0 && (
            <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-xs">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Area Performance Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Area Name</th>
                      <th className="px-4 py-3">Customers</th>
                      <th className="px-4 py-3">Active Loans</th>
                      <th className="px-4 py-3">Loan Amount</th>
                      <th className="px-4 py-3">Collected</th>
                      <th className="px-4 py-3">Pending</th>
                      <th className="px-4 py-3">Overdue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.area_summaries.map((a) => (
                      <tr key={a.area_id} className="hover:bg-sky-50/40">
                        <td className="px-4 py-3.5 font-bold text-slate-900">{a.area_name}</td>
                        <td className="px-4 py-3.5 font-medium">{a.total_customers}</td>
                        <td className="px-4 py-3.5 font-medium">{a.total_active_loans}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-800">
                          ₹{a.total_loan_given.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-emerald-600">
                          ₹{a.total_collected.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-amber-600">
                          ₹{a.total_pending.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-red-600">
                          ₹{a.overdue_amount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
