import { Eye, Pencil, Plus, Search, WalletCards } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { DataTable, type Column } from "../components/DataTable";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { useAppData } from "../context/AppDataContext";
import type { Customer } from "../types";
import { formatCurrency } from "../utils/format";

export default function CustomersPage() {
  const { customers } = useAppData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const navigate = useNavigate();
  const filtered = useMemo(() => customers.filter((customer) => {
    const matchesQuery = `${customer.name} ${customer.mobile} ${customer.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || customer.status === status;
    return matchesQuery && matchesStatus;
  }), [customers, query, status]);

  const columns: Column<Customer>[] = [
    { key: "id", header: "Customer ID", render: (row) => row.id },
    { key: "photo", header: "Photo", render: (row) => <img className="h-10 w-10 rounded-md object-cover" src={row.photoUrl || "https://i.pravatar.cc/120"} alt={`${row.name} profile`} /> },
    { key: "name", header: "Name", render: (row) => row.name },
    { key: "mobile", header: "Mobile", render: (row) => row.mobile },
    { key: "address", header: "Address", render: (row) => <span className="block max-w-60 truncate">{row.address}</span> },
    { key: "loans", header: "Active Loans", render: (row) => row.activeLoans },
    { key: "outstanding", header: "Outstanding", render: (row) => formatCurrency(row.outstanding) },
    { key: "status", header: "Status", render: (row) => <Badge>{row.status}</Badge> },
    { key: "actions", header: "Actions", render: (row) => <div className="flex gap-2"><Button variant="secondary" className="px-2" aria-label="View customer" icon={<Eye size={16} />} onClick={() => navigate(`/customers/${row.id}`)} /><Button variant="secondary" className="px-2" aria-label="Edit customer" icon={<Pencil size={16} />} /><Button variant="secondary" className="px-2" aria-label="Loans" icon={<WalletCards size={16} />} onClick={() => navigate("/loans")} /><Button className="px-3" onClick={() => navigate("/loans/new")}>Add Loan</Button></div> },
  ];

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-black text-slate-950">Customers</h1><p className="text-sm font-semibold text-slate-500">Search, filter, and manage borrower profiles.</p></div>
        <Link to="/customers/new"><Button icon={<Plus size={18} />}>Add Customer</Button></Link>
      </div>
      <div className="grid gap-3 rounded-lg border border-sky-100 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px]">
        <Input label="Search by name, mobile, customer ID" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers" />
        <Select label="Filter status" value={status} onChange={(event) => setStatus(event.target.value)} options={["All", "Active", "Inactive"]} />
      </div>
      <div className="sr-only"><Search /></div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
