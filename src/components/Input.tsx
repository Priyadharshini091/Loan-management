import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        className={`min-h-10 rounded-md border border-sky-100 bg-white px-3 py-2 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-400 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}
