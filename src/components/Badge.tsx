import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  const text = String(children);
  const color = text.includes("PAID") || text.includes("Active") || text.includes("COMPLETED")
    ? "bg-green-50 text-green-700 border-green-200"
    : text.includes("PARTIAL") || text.includes("Pending")
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : text.includes("OVERDUE") || text.includes("Inactive")
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-sky-50 text-sky-700 border-sky-200";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${color}`}>{children}</span>;
}
