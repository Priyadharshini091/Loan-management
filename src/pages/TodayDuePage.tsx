import React, { useState, useEffect } from "react";
import type { Installment, Area } from "../types";
import { installmentApi, areaApi, paymentApi, pdfApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Search, Printer, CheckCircle2 } from "lucide-react";

export default function TodayDuePage() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [collectModalInst, setCollectModalInst] = useState<Installment | null>(null);
  const [payAmount, setPayAmount] = useState<string>("");
  const [payMethod, setPayMethod] = useState<string>("Cash");
  const [remarks, setRemarks] = useState<string>("");

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const areaList = await areaApi.getAreas();
      setAreas(areaList);

      const list = await installmentApi.getTodayDue(selectedAreaId || undefined);
      setInstallments(list);
    } catch (err) {
      showToast("Failed to load today's due list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedAreaId]);

  const openCollect = (inst: Installment) => {
    setCollectModalInst(inst);
    setPayAmount(inst.balance.toString());
    setPayMethod("Cash");
    setRemarks("Today's due collection");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalInst) return;

    const numAmt = parseFloat(payAmount);
    if (isNaN(numAmt) || numAmt <= 0) {
      showToast("Please enter a valid payment amount", "error");
      return;
    }

    try {
      const res = await paymentApi.recordPayment({
        loan_id: collectModalInst.loan_id,
        installment_id: collectModalInst.installment_id,
        amount_paid: numAmt,
        payment_method: payMethod,
        remarks,
      });

      showToast(`Payment recorded! Receipt #${res.receipt_number}`, "success");
      setCollectModalInst(null);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to record payment", "error");
    }
  };

  const filtered = installments.filter(
    (i) =>
      i.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      i.mobile_number.includes(search) ||
      i.loan_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Today's Due Collections</h1>
          <p className="text-sm font-medium text-slate-500">
            Field collection list for {new Date().toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-sky-100 bg-white p-4 shadow-xs sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
          <Search className="text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search customer, mobile or loan #..."
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
          <div className="py-12 text-center text-slate-500 font-medium">Loading today's due list...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">No installments due today.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Loan #</th>
                  <th className="px-4 py-3">Due Amt</th>
                  <th className="px-4 py-3">Paid Amt</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inst) => (
                  <tr key={inst.installment_id} className="hover:bg-sky-50/40">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{inst.customer_name}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-600">{inst.mobile_number}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{inst.area_name}</td>
                    <td className="px-4 py-3.5 font-medium text-sky-800">{inst.loan_number}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">₹{inst.due_amount}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">₹{inst.paid_amount}</td>
                    <td className="px-4 py-3.5 font-bold text-amber-600">₹{inst.balance}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={inst.status === "PAID" ? "success" : "warning"}>{inst.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {inst.balance > 0 ? (
                        <Button size="sm" onClick={() => openCollect(inst)}>
                          Collect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Printer size={14} />}
                          onClick={() => pdfApi.downloadReceipt(inst.receipt_number || "")}
                        >
                          Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {collectModalInst && (
        <Modal title={`Collect Today's Due - ${collectModalInst.customer_name}`} onClose={() => setCollectModalInst(null)}>
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <Input
              label="Payment Amount (₹) *"
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              required
            />
            <Select
              label="Payment Method *"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              options={[
                { value: "Cash", label: "Cash" },
                { value: "UPI", label: "UPI" },
                { value: "Bank Transfer", label: "Bank Transfer" },
                { value: "Other", label: "Other" },
              ]}
            />
            <Input label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={() => setCollectModalInst(null)}>
                Cancel
              </Button>
              <Button type="submit">Submit Payment</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
