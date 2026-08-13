import type { ReactNode } from "react";

export function Badge({
  children,
  variant,
}: {
  children: ReactNode;
  variant?: "success" | "warning" | "secondary" | "danger";
}) {
  const text = String(children);

  let color = "bg-sky-50 text-sky-700 border-sky-200";

  if (variant === "success" || text.includes("PAID") || text.includes("Active") || text.includes("COMPLETED")) {
    color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (variant === "warning" || variant === "secondary" || text.includes("PARTIAL") || text.includes("PENDING") || text.includes("Pending")) {
    color = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (variant === "danger" || text.includes("OVERDUE") || text.includes("Inactive")) {
    color = "bg-red-50 text-red-700 border-red-200";
  }

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${color}`}>
      {children}
    </span>
  );
}
