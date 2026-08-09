import { Download, FileSpreadsheet } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { DataTable, type Column } from "../../components/DataTable";
import { StatCard } from "../../components/StatCard";
import { reportService } from "../../services/reportService";
import type { Report } from "../../types";
import { downloadCsv, openPrintableReport, type ExportRow } from "../../utils/export";
import { formatCurrency } from "../../utils/format";

interface OverdueRow {
  customer: string;
  mobile: string;
  loanId: string;
  dueDate: string;
  daysOverdue: number;
  dueAmount: number;
  outstanding: number;
  status: string;
}

const overdueRows: OverdueRow[] = [
  { customer: "Suresh", mobile: "9876543212", loanId: "LN0003", dueDate: "2026-08-05", daysOverdue: 4, dueAmount: 1100, outstanding: 39200, status: "OVERDUE" },
  { customer: "Arjun Reddy", mobile: "9876543214", loanId: "LN0004", dueDate: "2026-08-01", daysOverdue: 8, dueAmount: 2500, outstanding: 29500, status: "OVERDUE" },
];

export default function ReportPage({ type }: { type: "daily" | "weekly" | "monthly" }) {
  const [report, setReport] = useState<Report | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  useEffect(() => {
    void reportService.get(type).then(setReport);
  }, [type]);
  if (!report) return null;
  const title = `${type[0].toUpperCase()}${type.slice(1)} Report`;
  const columns: Column<OverdueRow>[] = [
    { key: "customer", header: "Customer", render: (row) => row.customer },
    { key: "mobile", header: "Mobile", render: (row) => row.mobile },
    { key: "loan", header: "Loan ID", render: (row) => row.loanId },
    { key: "dueDate", header: "Due Date", render: (row) => row.dueDate },
    { key: "days", header: "Days Overdue", render: (row) => row.daysOverdue },
    { key: "due", header: "Due Amount", render: (row) => formatCurrency(row.dueAmount) },
    { key: "outstanding", header: "Outstanding", render: (row) => formatCurrency(row.outstanding) },
    { key: "status", header: "Status", render: (row) => row.status },
  ];
  const exportRows = (): ExportRow[] => [
    { Section: "Summary", Item: "Period", Value: report.period },
    { Section: "Summary", Item: "Selected Date", Value: date },
    { Section: "Summary", Item: "Total Due", Value: report.totalDue },
    { Section: "Summary", Item: "Total Collected", Value: report.totalCollected },
    { Section: "Summary", Item: "Pending", Value: report.pending },
    { Section: "Summary", Item: "Number of Payments", Value: report.numberOfPayments },
    ...Object.entries(report.methods).map(([method, amount]) => ({ Section: "Payment Method", Item: method, Value: amount })),
    ...overdueRows.map((row) => ({
      Section: "Overdue Customer",
      Item: row.customer,
      Mobile: row.mobile,
      LoanID: row.loanId,
      DueDate: row.dueDate,
      DaysOverdue: row.daysOverdue,
      DueAmount: row.dueAmount,
      Outstanding: row.outstanding,
      Status: row.status,
    })),
  ];
  const exportExcel = () => downloadCsv(`${type}-report-${date}.csv`, exportRows());
  const exportPdf = () => {
    const methodRows = Object.entries(report.methods).map(([method, amount]) => `<tr><td>${method}</td><td>${formatCurrency(amount)}</td></tr>`).join("");
    const overdueTableRows = overdueRows.map((row) => `<tr><td>${row.customer}</td><td>${row.mobile}</td><td>${row.loanId}</td><td>${row.dueDate}</td><td>${row.daysOverdue}</td><td>${formatCurrency(row.dueAmount)}</td><td>${formatCurrency(row.outstanding)}</td><td>${row.status}</td></tr>`).join("");
    openPrintableReport(title, `
      <h1>${title}</h1>
      <p><strong>Period:</strong> ${report.period}</p>
      <p><strong>Selected Date:</strong> ${date}</p>
      <div class="summary">
        <div class="box"><div class="label">Total Due</div><div class="value">${formatCurrency(report.totalDue)}</div></div>
        <div class="box"><div class="label">Total Collected</div><div class="value">${formatCurrency(report.totalCollected)}</div></div>
        <div class="box"><div class="label">Pending</div><div class="value">${formatCurrency(report.pending)}</div></div>
        <div class="box"><div class="label">Number of Payments</div><div class="value">${report.numberOfPayments}</div></div>
      </div>
      <h2>Payment Methods</h2>
      <table><thead><tr><th>Method</th><th>Amount</th></tr></thead><tbody>${methodRows}</tbody></table>
      <h2>Overdue Customers</h2>
      <table><thead><tr><th>Customer</th><th>Mobile</th><th>Loan ID</th><th>Due Date</th><th>Days Overdue</th><th>Due Amount</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>${overdueTableRows}</tbody></table>
    `);
  };
  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div><h1 className="text-2xl font-black text-slate-950">{title}</h1><p className="text-sm font-semibold text-slate-500">{report.period}</p></div>
        <div className="grid gap-2 sm:grid-cols-[180px_auto_auto]">
          <label className="grid gap-1 text-sm font-bold text-slate-600">
            <span>Date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-h-10 rounded-md border border-sky-100 bg-white px-3 py-2" />
          </label>
          <Button variant="secondary" className="w-full self-end sm:w-auto" icon={<FileSpreadsheet size={18} />} onClick={exportExcel}>Export Excel</Button>
          <Button variant="secondary" className="w-full self-end sm:w-auto" icon={<Download size={18} />} onClick={exportPdf}>Export PDF</Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Due" value={formatCurrency(report.totalDue)} detail="Scheduled demand" icon={null} />
        <StatCard title="Total Collected" value={formatCurrency(report.totalCollected)} detail="Posted payments" icon={null} />
        <StatCard title="Pending" value={formatCurrency(report.pending)} detail="Open balance" icon={null} />
        <StatCard title="Number of Payments" value={report.numberOfPayments} detail="Receipts issued" icon={null} />
      </div>
      <section className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Payment Methods</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.entries(report.methods).map(([method, amount]) => <div key={method} className="rounded-md bg-sky-50 p-4"><p className="text-sm font-bold text-slate-500">{method}</p><p className="mt-2 text-xl font-black text-slate-950">{formatCurrency(amount)}</p></div>)}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-black text-slate-900">Overdue Customers</h2>
        <DataTable columns={columns} data={overdueRows} />
      </section>
    </div>
  );
}
