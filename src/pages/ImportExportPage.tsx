import React, { useState } from "react";
import { excelApi } from "../api";
import { useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import type { ExcelImportPreview } from "../types";
import { Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle, FileText } from "lucide-react";

export default function ImportExportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ExcelImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(null);
    }
  };

  const handlePreviewImport = async () => {
    if (!file) {
      showToast("Please select an Excel .xlsx file first", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await excelApi.previewImport(file);
      setPreview(res);
      if (res.valid) {
        showToast("Excel file validated successfully!", "success");
      } else {
        showToast(`Found ${res.errors.length} validation errors`, "warning");
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Import preview failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCommitImport = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      const res = await excelApi.commitImport(preview);
      showToast(res.message, "success");
      setPreview(null);
      setFile(null);
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Import failed", "error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Excel Import / Export</h1>
        <p className="text-sm font-medium text-slate-500">
          Bulk import customers/areas from Excel workbook or export system reports
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Import Box */}
        <div className="rounded-xl border border-sky-100 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-sky-100 p-2 text-sky-700">
              <Upload size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Import Excel Workbook</h2>
              <p className="text-xs text-slate-500">Upload .xlsx file containing Customers or Areas</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-lg border-2 border-dashed border-sky-200 bg-sky-50/50 p-6 text-center">
              <FileSpreadsheet className="mx-auto text-sky-500" size={40} />
              <p className="mt-2 text-sm font-bold text-slate-700">
                {file ? file.name : "Select an Excel File (.xlsx)"}
              </p>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-sky-700 cursor-pointer"
              />
            </div>

            <Button
              className="w-full justify-center"
              onClick={handlePreviewImport}
              disabled={!file || loading}
            >
              {loading ? "Validating Excel File..." : "Preview & Validate Import"}
            </Button>
          </div>
        </div>

        {/* Export Box */}
        <div className="rounded-xl border border-sky-100 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <Download size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Export System Data</h2>
              <p className="text-xs text-slate-500">Download formatted Excel spreadsheets</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <Button
              variant="outline"
              className="justify-between"
              onClick={() => excelApi.exportCustomers()}
              icon={<Download size={16} />}
            >
              Export Customers Master Excel
            </Button>
            <Button
              variant="outline"
              className="justify-between"
              onClick={() => excelApi.exportLoans()}
              icon={<Download size={16} />}
            >
              Export Active Loans Excel
            </Button>
            <Button
              variant="outline"
              className="justify-between"
              onClick={() => excelApi.exportPayments()}
              icon={<Download size={16} />}
            >
              Export Payment History Excel
            </Button>
            <Button
              variant="outline"
              className="justify-between"
              onClick={() => excelApi.exportAreaReport()}
              icon={<Download size={16} />}
            >
              Export Area Collection Report Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="rounded-xl border border-sky-200 bg-white p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900">Excel Import Validation Results</h3>
            {preview.valid ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                <CheckCircle size={16} /> Validated (Ready to Commit)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                <AlertTriangle size={16} /> Validation Errors Found
              </span>
            )}
          </div>

          <div className="flex gap-4 text-xs font-bold text-slate-700">
            <p>Customers to Import: <span className="text-sky-700">{preview.summary.Customers}</span></p>
            <p>Areas to Import: <span className="text-sky-700">{preview.summary.Areas}</span></p>
          </div>

          {preview.errors.length > 0 && (
            <div className="rounded-lg bg-red-50 p-4 space-y-1">
              <p className="text-xs font-bold text-red-800">Errors to fix before import:</p>
              <ul className="list-disc pl-5 text-xs text-red-700 space-y-1">
                {preview.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {preview.preview_customers.length > 0 && (
            <div className="overflow-x-auto">
              <p className="mb-2 text-xs font-bold uppercase text-slate-500">Preview Customers List:</p>
              <table className="w-full text-left text-xs text-slate-700 border border-slate-200">
                <thead className="bg-slate-100 font-bold uppercase">
                  <tr>
                    <th className="p-2 border">Customer Name</th>
                    <th className="p-2 border">Mobile</th>
                    <th className="p-2 border">Area</th>
                    <th className="p-2 border">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview_customers.slice(0, 5).map((c, i) => (
                    <tr key={i}>
                      <td className="p-2 border font-bold">{c.customer_name}</td>
                      <td className="p-2 border">{c.mobile_number}</td>
                      <td className="p-2 border">{c.area_name}</td>
                      <td className="p-2 border">{c.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.preview_customers.length > 5 && (
                <p className="mt-1 text-xs text-slate-500">...and {preview.preview_customers.length - 5} more customers</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setPreview(null)}>
              Cancel
            </Button>
            <Button onClick={handleCommitImport} disabled={!preview.valid || importing}>
              {importing ? "Importing Data..." : "Confirm & Commit Import"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
