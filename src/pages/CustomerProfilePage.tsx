import { FileText, History, UserRound, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { DataTable, type Column } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { StatCard } from "../components/StatCard";
import { useAppData } from "../context/AppDataContext";
import type { Loan, Payment } from "../types";
import { formatCurrency, maskAadhaar } from "../utils/format";

export default function CustomerProfilePage() {
  const { id = "" } = useParams();
  const { customers, loans, payments } = useAppData();
  const [tab, setTab] = useState("Overview");
  const customer = customers.find((item) => item.id === id);
  const customerLoans = loans.filter((loan) => loan.customerId === id);
  const customerPayments = payments.filter((payment) => payment.customerId === id);
  const totals = useMemo(() => ({
    borrowed: customerLoans.reduce((sum, loan) => sum + loan.amount, 0),
    paid: customerLoans.reduce((sum, loan) => sum + loan.paid, 0),
    outstanding: customerLoans.reduce((sum, loan) => sum + loan.outstanding, 0),
  }), [customerLoans]);
  if (!customer) return <EmptyState title="Customer not found" />;
  const loanColumns: Column<Loan>[] = [
    { key: "id", header: "Loan ID", render: (row) => row.id },
    { key: "amount", header: "Loan Amount", render: (row) => formatCurrency(row.amount) },
    { key: "emi", header: "EMI", render: (row) => formatCurrency(row.emi) },
    { key: "outstanding", header: "Outstanding", render: (row) => formatCurrency(row.outstanding) },
    { key: "status", header: "Status", render: (row) => <Badge>{row.status}</Badge> },
  ];
  const paymentColumns: Column<Payment>[] = [
    { key: "receipt", header: "Receipt", render: (row) => row.receiptNumber },
    { key: "date", header: "Date", render: (row) => row.date },
    { key: "paid", header: "Paid", render: (row) => formatCurrency(row.paidAmount) },
    { key: "method", header: "Method", render: (row) => row.paymentMethod },
  ];
  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <img src={customer.photoUrl} alt={`${customer.name} profile`} className="h-24 w-24 rounded-lg object-cover" />
          <div className="grid gap-1">
            <Badge>{customer.status}</Badge>
            <h1 className="text-2xl font-black text-slate-950">{customer.name}</h1>
            <p className="font-semibold text-slate-600">{customer.id} · {customer.mobile} · {customer.occupation}</p>
            <p className="text-sm text-slate-500">{customer.address}</p>
            <p className="text-sm font-semibold text-slate-500">Aadhaar: {maskAadhaar(customer.aadhaar)}</p>
          </div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Loans" value={customerLoans.length} detail="Loans linked to profile" icon={<WalletCards size={20} />} />
        <StatCard title="Total Borrowed" value={formatCurrency(totals.borrowed)} detail="Principal amount" icon={<UserRound size={20} />} />
        <StatCard title="Total Paid" value={formatCurrency(totals.paid)} detail="Across all receipts" icon={<History size={20} />} />
        <StatCard title="Outstanding" value={formatCurrency(totals.outstanding)} detail="Current balance" icon={<FileText size={20} />} />
      </div>
      <div className="flex flex-wrap gap-2">{["Overview", "Loans", "Payment History", "Documents"].map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-md px-4 py-2 text-sm font-bold ${tab === item ? "bg-sky-600 text-white" : "bg-white text-slate-700"}`}>{item}</button>)}</div>
      {tab === "Overview" ? <section className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">Guarantor</h2><p className="mt-2 text-sm text-slate-600">{customer.guarantor?.name ?? "-"} · {customer.guarantor?.mobile ?? "-"}</p><p className="mt-4 text-sm text-slate-600">{customer.notes ?? "No notes added."}</p></section> : null}
      {tab === "Loans" ? <DataTable columns={loanColumns} data={customerLoans} /> : null}
      {tab === "Payment History" ? <DataTable columns={paymentColumns} data={customerPayments} /> : null}
      {tab === "Documents" ? <EmptyState title="Document previews will connect to backend storage later." /> : null}
    </div>
  );
}
