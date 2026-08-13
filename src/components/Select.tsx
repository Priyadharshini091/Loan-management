import type { SelectHTMLAttributes } from "react";

interface OptionObj {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: (string | OptionObj)[];
}

export function Select({ label, options, className = "", ...props }: SelectProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <select
        className={`min-h-10 rounded-md border border-sky-100 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-sky-500 focus:outline-none ${className}`}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
    </label>
  );
}
