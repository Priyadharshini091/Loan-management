import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, CalendarDays, ChevronDown, CreditCard, FileBarChart, Home, LogOut, Menu, Settings, Users, WalletCards, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";

const navGroups = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Customers", icon: Users, children: [{ label: "All Customers", path: "/customers" }, { label: "Add Customer", path: "/customers/new" }] },
  { label: "Loans", icon: WalletCards, children: [{ label: "All Loans", path: "/loans" }, { label: "Add Loan", path: "/loans/new" }] },
  { label: "Collections", icon: CreditCard, children: [{ label: "Today's Due", path: "/collections/today" }, { label: "Payment History", path: "/payments" }] },
  { label: "Reports", icon: FileBarChart, children: [{ label: "Daily Report", path: "/reports/daily" }, { label: "Weekly Report", path: "/reports/weekly" }, { label: "Monthly Report", path: "/reports/monthly" }] },
  { label: "Users", path: "/users", icon: Users },
  { label: "Settings", path: "/settings", icon: Settings },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("loan_demo_auth");
    navigate("/login");
  };
  return (
    <aside className="flex h-full w-72 flex-col border-r border-sky-100 bg-white">
      <div className="flex items-center gap-3 border-b border-sky-100 px-5 py-5">
        <div className="rounded-md bg-sky-600 p-2 text-white"><BarChart3 size={22} /></div>
        <div>
          <p className="text-sm font-black tracking-wide text-slate-950">LOAN MANAGEMENT</p>
          <p className="text-xs font-semibold text-sky-700">Finance Office</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navGroups.map((item) => {
          const Icon = item.icon;
          if ("children" in item) {
            return (
              <div key={item.label} className="rounded-md">
                <div className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-slate-700">
                  <Icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  <ChevronDown size={16} />
                </div>
                <div className="ml-8 grid gap-1">
                  {item.children!.map((child) => (
                    <NavLink key={child.path} onClick={onNavigate} to={child.path} className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? "bg-sky-100 text-sky-800" : "text-slate-600 hover:bg-sky-50"}`}>
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <NavLink key={item.path} onClick={onNavigate} to={item.path} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold ${isActive ? "bg-sky-100 text-sky-800" : "text-slate-700 hover:bg-sky-50"}`}>
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <button onClick={logout} className="m-3 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-red-700 hover:bg-red-50">
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}

export function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-sky-50/60">
      <div className="fixed inset-y-0 left-0 hidden lg:block"><Sidebar /></div>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-slate-900/30" onClick={() => setOpen(false)} />
          <div className="relative h-full"><Sidebar onNavigate={() => setOpen(false)} /></div>
        </div>
      ) : null}
      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-sky-100 bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="px-2 lg:hidden" icon={<Menu size={22} />} onClick={() => setOpen(true)} aria-label="Open menu" />
            <div>
              <p className="text-sm font-bold text-slate-900">Loan Management System</p>
              <p className="hidden text-xs font-semibold text-slate-500 sm:block"><CalendarDays className="mr-1 inline" size={14} />09 Aug 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-900">Admin</p>
              <p className="text-xs font-semibold text-slate-500">ADMIN</p>
            </div>
            <button className="rounded-md p-2 text-slate-500 hover:bg-sky-50 lg:hidden" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
          </div>
        </header>
        <div className="p-4 md:p-6"><Outlet /></div>
      </main>
    </div>
  );
}
