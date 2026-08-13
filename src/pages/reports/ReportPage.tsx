import React, { useState, useEffect } from "react";
import type { Area } from "../../types";
import { reportApi, areaApi, pdfApi, emailApi } from "../../api";
import { useToast } from "../../components/Toast";
import { Button } from "../../components/Button";
import { Download, Mail, Printer, Filter } from "lucide-react";

export default function ReportPage({ type }: { type: "daily" | "weekly" | "monthly" }) {
  const [reportData, setReportData] = useState<any>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  const { showToast } = useToast();

  const loadReport = async () => {
    setLoading(true);
    try {
      const areaList = await areaApi.getAreas();
      setAreas(areaList);

      let data;
      if (type === "daily") {
        data = await reportApi.getDailyReport(selectedAreaId || undefined);
      } else if (type === "weekly") {
        data = await reportApi.getWeeklyReport(selectedAreaId || undefined);
      } else {
        data = await reportApi.getMonthlyReport(selectedAreaId || undefined);
      }
      setReportData(data);
    } catch (err) {
      showToast("Failed to load report", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [type, selectedAreaId]);

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await emailApi.sendReport(type, selectedAreaId || undefined);
      showToast(`Report emailed successfully to ${res.recipient}!`, "success");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to send email report", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const areaName = areas.find((a) => a.area_id === selectedAreaId)?.area_name || "All Areas";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {type.toUpperCase()} COLLECTION REPORT
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Financial collection breakdown for {areaName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            icon={<Printer size={16} />}
            onClick={() => pdfApi.downloadReport(type, selectedAreaId || undefined)}
          >
            Download PDF Report
          </Button>

          <Button
            icon={<Mail size={16} />}
            onClick={handleSendEmail}
            disabled={sendingEmail}
          >
            {sendingEmail ? "Sending Email..." : "Email Report"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-sky-100 bg-white p-4 shadow-xs">
        <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
          <Filter size={14} className="text-sky-600" /> Filter Area:
        </label>
        <select
          value={selectedAreaId}
          onChange={(e) => setSelectedAreaId(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none"
        >
          <option value="">All Areas</option>
          {areas.map((a) => (
            <option key={a.area_id} value={a.area_id}>
              {a.area_name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">Generating report...</div>
      ) : reportData ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-5">
              <p className="text-xs font-bold uppercase text-slate-500">Total Collected</p>
              <p className="mt-1 text-2xl font-black text-emerald-600">
                ₹{reportData.total_collected.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-5">
              <p className="text-xs font-bold uppercase text-slate-500">Total Transactions</p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {reportData.total_payments_count}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-xs">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Payment Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Receipt #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.payments.map((p: any) => (
                    <tr key={p.payment_id} className="hover:bg-sky-50/40">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{p.receipt_number}</td>
                      <td className="px-4 py-3.5 font-bold text-sky-800">{p.customer_name}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">{p.area_name}</td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-600">{p.payment_date.slice(0, 10)}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-600">{p.payment_method}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600">₹{parseFloat(p.amount_paid).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
