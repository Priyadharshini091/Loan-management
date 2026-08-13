import React, { useState, useEffect } from "react";
import type { Area, Installment } from "../types";
import { areaApi, installmentApi, paymentApi, pdfApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Search, MapPin, Calendar, CheckCircle2, Printer, DollarSign, Filter } from "lucide-react";

export default function AreaCollectionPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

      const targetArea = selectedAreaId || (areaList.length > 0 ? areaList[0].area_id : "");
      if (targetArea && targetArea !== selectedAreaId) {
        setSelectedAreaId(targetArea);
      }

      if (targetArea) {
        const insts = await installmentApi.getInstallments({
          area_id: targetArea,
          date: date,
        });
        setInstallments(insts);
      }
    } catch (err) {
      showToast("Failed to load collection items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedAreaId, date]);

  const openCollect = (inst: Installment, isPartial = false) => {
    setCollectModalInst(inst);
    setPayAmount(isPartial ? (inst.balance / 2).toString() : inst.balance.toString());
    setPayMethod("Cash");
    setRemarks(isPartial ? "Partial payment" : "Full payment");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalInst) return;

    const numAmt = parseFloat(payAmount);
    if (isNaN(numAmt) || numAmt <= 0) {
      showToast("Please enter a valid payment amount", "error");
      return;
    }
    if (numAmt > collectModalInst.balance) {
      showToast(`Payment cannot exceed current balance (₹${collectModalInst.balance})`, "error");
      return;
    }

    try {
      const res = await paymentApi.recordPayment({
        loan_id: collectModalInst.loan_id,
        installment_id: collectModalInst.installment_id,
        amount_paid: numAmt,
        payment_method: payMethod,
        remarks: remarks,
      });

      showToast(`Payment collected! Receipt #${res.receipt_number}`, "success");
      setCollectModalInst(null);
      loadData();

      // Ask to print receipt
      if (confirm(`Payment recorded! Would you like to download PDF Receipt #${res.receipt_number}?`)) {
        pdfApi.downloadReceipt(res.receipt_number);
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to record payment", "error");
    }
  };

  const handleBulkCollectAll = async () => {
    const pendingInsts = installments.filter((i) => i.balance > 0);
    if (pendingInsts.length === 0) {
      showToast("No pending due items to collect", "warning");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to Bulk Collect full payments for ALL ${pendingInsts.length} pending due customers in this area?`
      )
    ) {
      return;
    }

    let successCount = 0;
    for (const inst of pendingInsts) {
      try {
        await paymentApi.recordPayment({
          loan_id: inst.loan_id,
          installment_id: inst.installment_id,
          amount_paid: inst.balance,
          payment_method: "Cash",
          remarks: "Bulk Collection",
        });
        successCount++;
      } catch (e) {
        console.error("Bulk collect error for", inst.installment_id, e);
      }
    }

    showToast(`Bulk collected ${successCount} payments successfully!`, "success");
    loadData();
  };

  const filtered = installments.filter(
    (i) =>
      i.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      i.mobile_number.includes(search) ||
      i.loan_number.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAreaObj = areas.find((a) => a.area_id === selectedAreaId);
  const totalDueSum = installments.reduce((acc, curr) => acc + curr.due_amount, 0);
  const totalPaidSum = installments.reduce((acc, curr) => acc + curr.paid_amount, 0);
  const totalPendingSum = installments.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Area Collection Screen</h1>
          <p className="text-sm font-medium text-slate-500">
            Daily field collection counter for selected area
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={handleBulkCollectAll} icon={<CheckCircle2 size={18} />}>
            Collect All (Bulk)
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid gap-4 rounded-xl border border-sky-100 bg-white p-4 shadow-xs sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Select Area *</label>
          <select
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-sky-500 focus:outline-none"
          >
            {areas.map((a) => (
              <option key={a.area_id} value={a.area_id}>
                {a.area_name} ({a.district})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Collection Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Search Customer</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Name, mobile or loan #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-9 text-sm font-medium text-slate-800 focus:border-sky-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 text-center">
          <p className="text-xs font-bold uppercase text-slate-500">Total Expected Due</p>
          <p className="mt-1 text-xl font-black text-slate-900">₹{totalDueSum.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
          <p className="text-xs font-bold uppercase text-emerald-700">Total Collected</p>
          <p className="mt-1 text-xl font-black text-emerald-600">₹{totalPaidSum.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-center">
          <p className="text-xs font-bold uppercase text-amber-700">Total Pending</p>
          <p className="mt-1 text-xl font-black text-amber-600">₹{totalPendingSum.toLocaleString()}</p>
        </div>
      </div>

      {/* Collection Table */}
      <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading collection list...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">
            No installments due on {date} for {selectedAreaObj?.area_name}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Loan #</th>
                  <th className="px-4 py-3">Due Amt</th>
                  <th className="px-4 py-3">Paid Amt</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inst) => {
                  let badgeVar: any = "success";
                  if (inst.status === "PENDING") badgeVar = "warning";
                  if (inst.status === "PARTIAL") badgeVar = "secondary";
                  if (inst.status === "OVERDUE") badgeVar = "danger";

                  return (
                    <tr key={inst.installment_id} className="hover:bg-sky-50/40">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{inst.customer_name}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-600">{inst.mobile_number}</td>
                      <td className="px-4 py-3.5 font-medium text-sky-800">{inst.loan_number}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">₹{inst.due_amount}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600">₹{inst.paid_amount}</td>
                      <td className="px-4 py-3.5 font-bold text-amber-600">₹{inst.balance}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={badgeVar}>{inst.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inst.balance > 0 ? (
                            <>
                              <Button size="sm" onClick={() => openCollect(inst, false)}>
                                Collect
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openCollect(inst, true)}>
                                Partial
                              </Button>
                            </>
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

      {/* Collect Modal */}
      {collectModalInst && (
        <Modal
          title={`Collect Payment - ${collectModalInst.customer_name}`}
          onClose={() => setCollectModalInst(null)}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="rounded-lg bg-sky-50 p-3 text-xs font-semibold text-slate-700 space-y-1">
              <p>Loan Number: <span className="font-bold text-slate-900">{collectModalInst.loan_number}</span></p>
              <p>Area: <span className="font-bold text-slate-900">{collectModalInst.area_name}</span></p>
              <p>Installment Due: <span className="font-bold text-slate-900">₹{collectModalInst.due_amount}</span></p>
              <p>Current Remaining Balance: <span className="font-bold text-amber-700">₹{collectModalInst.balance}</span></p>
            </div>

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

            <Input
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Field collection note..."
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={() => setCollectModalInst(null)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Collection</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
