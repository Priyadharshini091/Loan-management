import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, IndianRupee, TrendingUp, Users, Wallet, WalletCards } from "lucide-react";
import { dashboardStats, dailyCollections, loanStatus, monthlyCollections, paymentStatus } from "../data/mockDashboard";
import { StatCard } from "../components/StatCard";
import { formatCurrency } from "../utils/format";

const colors = ["#0284c7", "#16a34a", "#f59e0b", "#dc2626"];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm"><h2 className="mb-4 text-base font-black text-slate-900">{title}</h2><div className="h-72">{children}</div></section>;
}

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950">Dashboard</h1>
        <p className="text-sm font-semibold text-slate-500">Live-style financial overview using realistic mock data.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Total Customers" value={dashboardStats.totalCustomers} detail="8 added this month" icon={<Users size={22} />} />
        <StatCard title="Active Loans" value={dashboardStats.activeLoans} detail="Across 4 EMI cycles" icon={<WalletCards size={22} />} />
        <StatCard title="Total Loan Given" value={formatCurrency(dashboardStats.totalLoanGiven)} detail="Mock portfolio value" icon={<IndianRupee size={22} />} />
        <StatCard title="Collection Today" value={formatCurrency(dashboardStats.collectionToday)} detail="67% of due collected" icon={<TrendingUp size={22} />} />
        <StatCard title="Pending Amount" value={formatCurrency(dashboardStats.pendingAmount)} detail="Requires follow-up" icon={<Wallet size={22} />} />
        <StatCard title="Overdue Customers" value={dashboardStats.overdueCustomers} detail="High priority" icon={<AlertTriangle size={22} />} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Daily Collection Chart">
          <ResponsiveContainer><AreaChart data={dailyCollections}><CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Area type="monotone" dataKey="amount" stroke="#0284c7" fill="#bae6fd" /></AreaChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly Collection Chart">
          <ResponsiveContainer><BarChart data={monthlyCollections}><CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Loan Status Chart">
          <ResponsiveContainer><PieChart><Pie dataKey="value" data={loanStatus} outerRadius={95} label>{loanStatus.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Payment Status">
          <ResponsiveContainer><PieChart><Pie dataKey="value" data={paymentStatus} innerRadius={55} outerRadius={95} label>{paymentStatus.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
