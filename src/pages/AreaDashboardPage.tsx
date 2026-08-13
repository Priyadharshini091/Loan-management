import React, { useState, useEffect } from "react";
import type { Area, Customer, Loan, Installment, AreaDashboardStats } from "../types";
import { areaApi, dashboardApi, customerApi, loanApi, installmentApi } from "../api";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/Badge";
import { Users, Wallet, CreditCard, Clock, AlertTriangle, CheckCircle2, ChevronDown, MapPin } from "lucide-react";

export default function AreaDashboardPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [stats, setStats] = useState<AreaDashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [todayInstallments, setTodayInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (areaId: string) => {
    setLoading(true);
    try {
      const areaList = await areaApi.getAreas();
      setAreas(areaList);

      const targetId = areaId || (areaList.length > 0 ? areaList[0].area_id : "");
      if (targetId && targetId !== selectedAreaId) {
        setSelectedAreaId(targetId);
      }

      if (targetId) {
        const areaStats = await dashboardApi.getAreaDashboard(targetId);
        setStats(areaStats);

        const custs = await customerApi.getCustomers({ area_id: targetId });
        setCustomers(custs);

        const areaLoans = await loanApi.getLoans({ area_id: targetId });
        setLoans(areaLoans);

        const todays = await installmentApi.getTodayDue(targetId);
        setTodayInstallments(todays);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedAreaId);
  }, [selectedAreaId]);

  const selectedAreaObj = areas.find((a) => a.area_id === selectedAreaId);

  return (
    <div className="space-y-6">
      {/* Area Selector Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-600 to-sky-800 p-6 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-100 backdrop-blur-xs">
            <MapPin size={14} /> Area Dashboard
          </span>
          <h1 className="mt-2 text-2xl font-black tracking-tight">
            {selectedAreaObj ? selectedAreaObj.area_name.toUpperCase() : "AREA STATISTICS"}
          </h1>
          <p className="text-xs font-medium text-sky-100">
            Real-time financial performance and field collection metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-sky-100 uppercase">Select Zone:</label>
          <div className="relative">
            <select
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              className="appearance-none rounded-lg bg-white px-4 py-2.5 pr-10 text-sm font-bold text-slate-900 shadow-xs focus:outline-none"
            >
              {areas.map((a) => (
                <option key={a.area_id} value={a.area_id}>
                  {a.area_name} ({a.district})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 text-slate-500" size={16} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">Loading area statistics...</div>
      ) : stats ? (
        <>
          {/* 9 Key Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Customers" value={stats.total_customers} icon={<Users size={22} />} />
            <StatCard title="Total Active Loans" value={stats.total_active_loans} icon={<Wallet size={22} />} />
            <StatCard
              title="Total Loan Given"
              value={`₹${stats.total_loan_given.toLocaleString("en-IN")}`}
              icon={<CreditCard size={22} />}
            />
            <StatCard
              title="Total Collection"
              value={`₹${stats.total_collected.toLocaleString("en-IN")}`}
              icon={<CheckCircle2 size={22} />}
            />
            <StatCard
              title="Total Pending"
              value={`₹${stats.total_pending.toLocaleString("en-IN")}`}
              icon={<Clock size={22} />}
            />
            <StatCard
              title="Today's Due"
              value={`₹${stats.todays_due.toLocaleString("en-IN")}`}
              icon={<Clock size={22} />}
            />
            <StatCard
              title="Today's Collection"
              value={`₹${stats.todays_collection.toLocaleString("en-IN")}`}
              icon={<CheckCircle2 size={22} />}
            />
            <StatCard
              title="Overdue Amount"
              value={`₹${stats.overdue_amount.toLocaleString("en-IN")}`}
              icon={<AlertTriangle size={22} />}
            />
            <StatCard
              title="Overdue Customers"
              value={stats.overdue_customers}
              icon={<AlertTriangle size={22} />}
            />
          </div>

          {/* Area Customer List Table */}
          <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedAreaObj?.area_name} Customer List & Payment Status
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {customers.length} Customers Registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Customer Name</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Active Loans</th>
                    <th className="px-4 py-3">Today's Due</th>
                    <th className="px-4 py-3">Paid Today</th>
                    <th className="px-4 py-3">Pending Bal</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500 font-medium">
                        No customers in this area yet.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => {
                      const todayInst = todayInstallments.find((i) => i.customer_id === c.customer_id);
                      const custLoan = loans.find((l) => l.customer_id === c.customer_id);
                      const dueAmt = todayInst ? todayInst.due_amount : 0;
                      const paidAmt = todayInst ? todayInst.paid_amount : 0;
                      const balAmt = todayInst ? todayInst.balance : 0;
                      const status = todayInst ? todayInst.status : "PAID";

                      let badgeVar: any = "success";
                      if (status === "PENDING") badgeVar = "warning";
                      if (status === "PARTIAL") badgeVar = "secondary";
                      if (status === "OVERDUE") badgeVar = "danger";

                      return (
                        <tr key={c.customer_id} className="hover:bg-sky-50/40">
                          <td className="px-4 py-3.5 font-bold text-slate-900">{c.customer_name}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-600">{c.mobile_number}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-700">
                            {custLoan ? `${custLoan.loan_number} (₹${custLoan.loan_amount.toLocaleString()})` : "No Active Loan"}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-800">
                            ₹{dueAmt.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-emerald-600">
                            ₹{paidAmt.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-amber-600">
                            ₹{balAmt.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant={badgeVar}>{status}</Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
