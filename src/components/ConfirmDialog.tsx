import { Button } from "./Button";
import { Modal } from "./Modal";

export function ConfirmDialog({ open, onClose, onConfirm, title }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string }) {
  return (
    <Modal title="Confirm action" open={open} onClose={onClose}>
      <p className="text-slate-700">{title}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}
