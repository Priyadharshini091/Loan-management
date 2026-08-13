import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-sky-600 text-white hover:bg-sky-700 shadow-xs",
    secondary: "border border-sky-200 bg-white text-sky-800 hover:bg-sky-50",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-xs",
    ghost: "text-slate-700 hover:bg-sky-50",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs min-h-8",
    md: "px-4 py-2 text-sm min-h-10",
    lg: "px-6 py-3 text-base min-h-12",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
