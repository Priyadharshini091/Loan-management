export interface ExportRow {
  [key: string]: string | number;
}

const escapeCsvCell = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const downloadCsv = (filename: string, rows: ExportRow[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvCell(row[header] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const openPrintableReport = (title: string, body: string) => {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    window.print();
    return;
  }
  printWindow.document.write(`<!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #172033; margin: 32px; }
          h1 { margin: 0 0 8px; color: #075985; }
          h2 { margin-top: 28px; color: #172033; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th, td { border: 1px solid #dbeafe; padding: 10px; text-align: left; }
          th { background: #e0f2fe; }
          .summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 20px 0; }
          .box { border: 1px solid #dbeafe; padding: 12px; border-radius: 6px; }
          .label { color: #64748b; font-size: 12px; font-weight: 700; }
          .value { font-size: 20px; font-weight: 800; margin-top: 4px; }
          @media print { button { display: none; } body { margin: 18px; } }
        </style>
      </head>
      <body>${body}<button onclick="window.print()" style="margin-top:24px;padding:10px 14px;background:#0284c7;color:white;border:0;border-radius:6px;font-weight:700">Print or Save as PDF</button></body>
    </html>`);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => printWindow.print(), 300);
};
