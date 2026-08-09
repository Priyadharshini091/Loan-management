import type { ReactNode } from "react";

export function StatCard({ title, value, detail, icon }: { title: string; value: string | number; detail: string; icon: ReactNode }) {
  return (
    <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
        </div>
        <div className="rounded-md bg-sky-100 p-2 text-sky-700">{icon}</div>
      </div>
    </section>
  );
}
