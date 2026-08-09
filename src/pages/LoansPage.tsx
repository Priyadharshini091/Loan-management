import { Eye, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { DataTable, type Column } from "../components/DataTable";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { useAppData } from "../context/AppDataContext";
import type { Loan } from "../types";
import { formatCurrency } from "../utils/format";

export default function LoansPage() {
  const { loans } = useAppData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [frequency, setFrequency] = useState("All");
  const navigate = useNavigate();
  const filtered = useMemo(() => loans.filter((loan) => `${loan.customerName} ${loan.id}`.toLowerCase().includes(query.toLowerCase()) && (status === "All" || loan.status === status) && (frequency === "All" || loan.frequency === frequency)), [loans, query, status, frequency]);
  const columns: Column<Loan>[] = [
    { key: "id", header: "Loan ID", render: (row) => row.id },
    { key: "customer", header: "Customer", render: (row) => row.customerName },
    { key: "amount", header: "Loan Amount", render: (row) => formatCurrency(row.amount) },
    { key: "interest", header: "Interest %", render: (row) => `${row.interestRate}%` },
    { key: "interestAmount", header: "Interest Amount", render: (row) => formatCurrency(row.interestAmount) },
    { key: "total", header: "Total Payable", render: (row) => formatCurrency(row.totalPayable) },
    { key: "emi", header: "EMI", render: (row) => formatCurrency(row.emi) },
    { key: "frequency", header: "Frequency", render: (row) => row.frequency },
    { key: "date", header: "Loan Date", render: (row) => row.loanDate },
    { key: "outstanding", header: "Outstanding", render: (row) => formatCurrency(row.outstanding) },
    { key: "status", header: "Status", render: (row) => <Badge>{row.status}</Badge> },
    { key: "actions", header: "Actions", render: (row) => <Button variant="secondary" className="px-2" icon={<Eye size={16} />} aria-label="View loan" onClick={() => navigate(`/loans/${row.id}`)} /> },
  ];
  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-black text-slate-950">All Loans</h1><p className="text-sm font-semibold text-slate-500">Frontend-only loan portfolio view.</p></div><Link to="/loans/new"><Button icon={<Plus size={18} />}>Add Loan</Button></Link></div>
      <div className="grid gap-3 rounded-lg border border-sky-100 bg-white p-4 shadow-sm md:grid-cols-4">
        <Input label="Search customer or loan ID" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} options={["All", "ACTIVE", "COMPLETED", "OVERDUE"]} />
        <Select label="EMI Frequency" value={frequency} onChange={(event) => setFrequency(event.target.value)} options={["All", "Daily", "Weekly", "Monthly"]} />
        <Input label="Date" type="date" />
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
