import React, { useState, useEffect } from "react";
import { backupApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import type { BackupItem } from "../types";
import { Database, Download, RotateCcw, ShieldCheck, Clock, FileSpreadsheet } from "lucide-react";

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringItem, setRestoringItem] = useState<BackupItem | null>(null);
  const [restoring, setRestoring] = useState(false);

  const { showToast } = useToast();

  const loadBackups = async () => {
    setLoading(true);
    try {
      const list = await backupApi.listBackups();
      setBackups(list);
    } catch (err) {
      showToast("Failed to load backup history", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      const res = await backupApi.triggerBackup();
      showToast(`Backup ${res.filename} created successfully!`, "success");
      loadBackups();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create backup", "error");
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoringItem) return;
    setRestoring(true);
    try {
      const res = await backupApi.restoreBackup(restoringItem.filename);
      showToast(res.message, "success");
      setRestoringItem(null);
      loadBackups();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Restore failed", "error");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Database Backups & Restore</h1>
          <p className="text-sm font-medium text-slate-500">
            Automatic and manual snapshots of master Excel database (`loan_management.xlsx`)
          </p>
        </div>
        <Button onClick={handleCreateBackup} icon={<Database size={18} />}>
          Backup Now
        </Button>
      </div>

      <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-5 flex items-start gap-4">
        <ShieldCheck className="text-sky-600 mt-1 shrink-0" size={24} />
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-bold text-slate-900">Automatic Excel Safety Protocol Active</p>
          <p>
            An automatic timestamped backup is generated prior to every write/update operation. You can safely restore any past backup snapshot below. A safety snapshot is automatically created before any restore action.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Backup History & Snapshots</h2>
          <span className="text-xs font-semibold text-slate-500">
            {backups.length} Snapshots Available
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading backup history...</div>
        ) : backups.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">
            No backup snapshots found in `data/backups/`. Click "Backup Now" above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-sky-100 bg-sky-50/50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Backup File</th>
                  <th className="px-4 py-3">Created Timestamp</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backups.map((item) => (
                  <tr key={item.filename} className="hover:bg-sky-50/40">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="text-emerald-600" size={18} />
                      {item.filename}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600">{item.created_at}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">
                      {(item.size_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Download size={14} />}
                          onClick={() => backupApi.downloadBackup(item.filename)}
                        >
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={<RotateCcw size={14} />}
                          onClick={() => setRestoringItem(item)}
                        >
                          Restore
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {restoringItem && (
        <Modal
          title="Confirm Database Restore"
          onClose={() => setRestoringItem(null)}
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 p-4 border border-amber-200 text-xs font-medium text-amber-800 space-y-2">
              <p className="font-bold text-amber-900 flex items-center gap-1.5">
                <RotateCcw size={16} /> WARNING: You are restoring an older database snapshot!
              </p>
              <p>
                Restoring <span className="font-bold">{restoringItem.filename}</span> will overwrite your current Excel database (`loan_management.xlsx`).
              </p>
              <p>A safety backup snapshot of your current data will be saved before restoring.</p>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" onClick={() => setRestoringItem(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmRestore} disabled={restoring}>
                {restoring ? "Restoring..." : "Yes, Restore Backup"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
