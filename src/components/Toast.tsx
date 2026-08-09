import { createContext, useContext, useState, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const showToast = (next: string) => {
    setMessage(next);
    window.setTimeout(() => setMessage(""), 2800);
  };
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message ? (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-md border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-700 shadow-xl">
          <CheckCircle2 size={20} />
          {message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
};
