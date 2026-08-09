import { CreditCard } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { DataTable, type Column } from "../components/DataTable";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { Select } from "../components/Select";
import { StatCard } from "../components/StatCard";
import { useToast } from "../components/Toast";
import { useAppData } from "../context/AppDataContext";
import { paymentService } from "../services/paymentService";
import type { PaymentMethod, TodayDue } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

export default function TodayDuePage() {
  const { todayDues, refresh } = useAppData();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TodayDue | null>(null);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [remarks, setRemarks] = useState("");
  const filtered = todayDues.filter((due) => `${due.customerName} ${due.mobile} ${due.loanId}`.toLowerCase().includes(query.toLowerCase()));
  const totals = useMemo(() => ({
    due: todayDues.reduce((sum, due) => sum + due.dueAmount, 0),
    collected: todayDues.reduce((sum, due) => sum + due.paid, 0),
    pending: todayDues.reduce((sum, due) => sum + due.balance, 0),
  }), [todayDues]);
  const open = (due: TodayDue) => {
    setSelected(due);
    setAmount(due.balance || due.dueAmount);
    setMethod("Cash");
    setRemarks("");
  };
  const save = async () => {
    if (!selected || amount <= 0) return;
    await paymentService.collect(selected, amount, method, remarks);
    await refresh();
    showToast("Payment recorded successfully");
    setSelected(null);
  };
  const columns: Column<TodayDue>[] = [
    { key: "customer", header: "Customer", render: (row) => row.customerName },
    { key: "mobile", header: "Mobile", render: (row) => row.mobile },
    { key: "loan", header: "Loan ID", render: (row) => row.loanId },
    { key: "due", header: "Due Amount", render: (row) => formatCurrency(row.dueAmount) },
    { key: "paid", header: "Paid", render: (row) => formatCurrency(row.paid) },
    { key: "balance", header: "Balance", render: (row) => formatCurrency(row.balance) },
    { key: "status", header: "Status", render: (row) => <Badge>{row.status}</Badge> },
    { key: "action", header: "Action", render: (row) => <Button variant="secondary" icon={<CreditCard size={16} />} onClick={() => open(row)}>Collect</Button> },
  ];
  return (
    <div className="grid gap-6">
      <div><h1 className="text-2xl font-black text-slate-950">Today's Due</h1><p className="text-sm font-semibold text-slate-500">{formatDate(new Date())}</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Customers Due Today" value={25} detail="Mock collection route" icon={<CreditCard size={20} />} />
        <StatCard title="Total Due" value={formatCurrency(totals.due || 27500)} detail="Expected today" icon={<CreditCard size={20} />} />
        <StatCard title="Collected" value={formatCurrency(totals.collected || 18500)} detail="Recorded in mock state" icon={<CreditCard size={20} />} />
        <StatCard title="Pending" value={formatCurrency(totals.pending || 9000)} detail="Balance remaining" icon={<CreditCard size={20} />} />
      </div>
      <Input label="Search Today's Collection" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Customer, mobile, or loan ID" />
      <DataTable columns={columns} data={filtered} />
      <Modal title="Collect Payment" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="grid gap-4">
            <div className="rounded-md bg-sky-50 p-4 text-sm font-semibold text-slate-700"><p>Customer: {selected.customerName}</p><p>Loan ID: {selected.loanId}</p><p>Today's Due: {formatCurrency(selected.dueAmount)}</p><p>Outstanding Balance: {formatCurrency(selected.balance)}</p></div>
            <Input label="Payment Amount" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
            <Select label="Payment Method" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)} options={["Cash", "UPI", "Bank Transfer", "Other"]} />
            <label className="grid gap-1.5 text-sm font-medium text-slate-700"><span>Remarks</span><textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} className="min-h-24 rounded-md border border-sky-100 bg-white px-3 py-2" /></label>
            <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button><Button onClick={save}>Save Payment</Button></div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
