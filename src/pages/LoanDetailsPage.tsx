import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Loan, Installment, Payment } from "../types";
import { loanApi, installmentApi, paymentApi, pdfApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { BackButton } from "../components/BackButton";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Printer } from "lucide-react";

export default function LoanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [collectModalInst, setCollectModalInst] = useState<Installment | null>(null);
  const [payAmount, setPayAmount] = useState<string>("");
  const [payMethod, setPayMethod] = useState<string>("Cash");
  const [remarks, setRemarks] = useState<string>("");

  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadLoanDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const l = await loanApi.getLoan(id);
      setLoan(l);

      const insts = await installmentApi.getInstallments({ loan_id: id });
      setInstallments(insts);

      const pays = await paymentApi.getPayments({ loan_id: id });
      setPayments(pays);
    } catch (err) {
      showToast("Failed to load loan details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoanDetails();
  }, [id]);

  const openCollect = (inst: Installment) => {
    setCollectModalInst(inst);
    setPayAmount(inst.balance.toString());
    setPayMethod("Cash");
    setRemarks("Loan schedule payment");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalInst || !loan) return;

    const numAmt = parseFloat(payAmount);
    if (isNaN(numAmt) || numAmt <= 0) {
      showToast("Please enter a valid payment amount", "error");
      return;
    }

    try {
      const res = await paymentApi.recordPayment({
        loan_id: loan.loan_id,
        installment_id: collectModalInst.installment_id,
        amount_paid: numAmt,
        payment_method: payMethod,
        remarks,
      });

      showToast(`Payment recorded! Receipt #${res.receipt_number}`, "success");
      setCollectModalInst(null);
      loadLoanDetails();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to record payment", "error");
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500 font-medium">Loading loan details...</div>;
  if (!loan) return <div className="py-12 text-center text-slate-500 font-medium">Loan account not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loan #{loan.loan_number}</h1>
          <p className="text-sm font-medium text-slate-500">
            Customer: {loan.customer_name} ({loan.area_name})
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-sky-100 bg-white p-6 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
        <div>
          <p className="text-slate-400 uppercase">Loan Amount</p>
          <p className="text-lg font-black text-slate-900">₹{loan.loan_amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400 uppercase">Total Payable</p>
          <p className="text-lg font-black text-slate-900">₹{loan.total_payable.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400 uppercase">Total Paid</p>
          <p className="text-lg font-black text-emerald-600">₹{(loan.paid_amount || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400 uppercase">Outstanding Balance</p>
          <p className="text-lg font-black text-amber-600">₹{(loan.outstanding || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-xs">
        <h3 className="mb-4 text-lg font-bold text-slate-900">EMI Installment Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Inst #</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Due Amount</th>
                <th className="px-4 py-3">Paid Amount</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {installments.map((inst) => (
                <tr key={inst.installment_id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-bold text-slate-900">#{inst.installment_number}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600">{inst.due_date}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">₹{inst.due_amount}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">₹{inst.paid_amount}</td>
                  <td className="px-4 py-3 font-bold text-amber-600">₹{inst.balance}</td>
                  <td className="px-4 py-3">
                    <Badge variant={inst.status === "PAID" ? "success" : inst.status === "OVERDUE" ? "danger" : "warning"}>
                      {inst.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
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
      </div>

      {collectModalInst && (
        <Modal title={`Collect Payment - Inst #${collectModalInst.installment_number}`} onClose={() => setCollectModalInst(null)}>
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
