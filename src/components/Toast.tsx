import { createContext, useContext, useState, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "info">("success");
  const showToast = (next: string, nextType: "success" | "error" | "info" = "success") => {
    setMessage(next);
    setType(nextType);
    window.setTimeout(() => setMessage(""), 2800);
  };
  const tone = type === "error" ? "border-red-200 text-red-700" : type === "info" ? "border-sky-200 text-sky-700" : "border-green-200 text-green-700";
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message ? (
        <div className={`fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-md border bg-white px-4 py-3 text-sm font-semibold shadow-xl ${tone}`}>
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
