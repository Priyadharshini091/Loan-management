import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  open = true,
  onClose,
  children,
}: {
  title: string;
  open?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-xl bg-white shadow-2xl border border-sky-100">
        <div className="sticky top-0 flex items-center justify-between border-b border-sky-100 bg-white px-5 py-4">
          <h2 id="modal-title" className="text-lg font-bold text-slate-900">
            {title}
          </h2>
          <button
            aria-label="Close modal"
            className="rounded-md p-2 text-slate-500 hover:bg-sky-50"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
