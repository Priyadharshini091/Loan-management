import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { DataTable, type Column } from "../components/DataTable";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { Select } from "../components/Select";
import { useAppData } from "../context/AppDataContext";
import type { Payment } from "../types";
import { formatCurrency } from "../utils/format";

function ReceiptView({ payment }: { payment: Payment }) {
  return (
    <div className="print-area grid gap-4 rounded-md border border-sky-100 p-5">
      <h2 className="text-xl font-black text-slate-950">ABC Finance</h2>
      <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <p><strong>Receipt Number:</strong> {payment.receiptNumber}</p><p><strong>Date:</strong> {payment.date}</p>
        <p><strong>Customer:</strong> {payment.customerName}</p><p><strong>Loan ID:</strong> {payment.loanId}</p>
        <p><strong>Amount Due:</strong> {formatCurrency(payment.dueAmount)}</p><p><strong>Amount Paid:</strong> {formatCurrency(payment.paidAmount)}</p>
        <p><strong>Remaining Balance:</strong> {formatCurrency(payment.balance)}</p><p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
        <p><strong>Collected By:</strong> {payment.collectedBy}</p>
      </div>
    </div>
  );
}

export default function PaymentHistoryPage() {
  const { payments } = useAppData();
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("All");
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const filtered = useMemo(() => payments.filter((payment) => `${payment.customerName} ${payment.loanId} ${payment.receiptNumber}`.toLowerCase().includes(query.toLowerCase()) && (method === "All" || payment.paymentMethod === method)), [payments, query, method]);
  const columns: Column<Payment>[] = [
    { key: "receipt", header: "Receipt Number", render: (row) => row.receiptNumber },
    { key: "date", header: "Date", render: (row) => row.date },
    { key: "customer", header: "Customer", render: (row) => row.customerName },
    { key: "loan", header: "Loan ID", render: (row) => row.loanId },
    { key: "due", header: "Due Amount", render: (row) => formatCurrency(row.dueAmount) },
    { key: "paid", header: "Paid Amount", render: (row) => formatCurrency(row.paidAmount) },
    { key: "balance", header: "Balance", render: (row) => formatCurrency(row.balance) },
    { key: "method", header: "Payment Method", render: (row) => row.paymentMethod },
    { key: "by", header: "Collected By", render: (row) => row.collectedBy },
    { key: "action", header: "View Receipt", render: (row) => <Button variant="secondary" icon={<Eye size={16} />} onClick={() => setReceipt(row)}>View</Button> },
  ];
  return (
    <div className="grid gap-5">
      <div><h1 className="text-2xl font-black text-slate-950">Payment History</h1><p className="text-sm font-semibold text-slate-500">Mock receipts and payment filters.</p></div>
      <div className="grid gap-3 rounded-lg border border-sky-100 bg-white p-4 shadow-sm md:grid-cols-5">
        <Input label="Date From" type="date" /><Input label="Date To" type="date" /><Input label="Customer or Loan" value={query} onChange={(event) => setQuery(event.target.value)} /><Select label="Payment Method" value={method} onChange={(event) => setMethod(event.target.value)} options={["All", "Cash", "UPI", "Bank Transfer", "Other"]} /><Input label="Loan" placeholder="Loan ID" />
      </div>
      <DataTable columns={columns} data={filtered} />
      <Modal title="Receipt Preview" open={Boolean(receipt)} onClose={() => setReceipt(null)}>
        {receipt ? <><ReceiptView payment={receipt} /><div className="mt-5 flex justify-end gap-3"><Button variant="secondary" onClick={() => window.print()}>Print Receipt</Button><Button onClick={() => alert("Backend PDF endpoint will be connected in Phase 2.")}>Download PDF</Button></div></> : null}
      </Modal>
    </div>
  );
}
