import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

export function DataTable<T>({ columns, data, empty = "No records found" }: { columns: Column<T>[]; data: T[]; empty?: string }) {
  return (
    <div className="rounded-lg border border-sky-100 bg-white shadow-sm">
      <div className="grid gap-3 p-3 md:hidden">
        {data.map((row, index) => (
          <article key={index} className="rounded-md border border-sky-100 bg-white p-3 shadow-sm">
            {columns.map((column) => (
              <div key={column.key} className="grid grid-cols-[112px_1fr] gap-3 border-b border-sky-50 py-2 last:border-0">
                <span className="text-xs font-bold uppercase text-slate-500">{column.header}</span>
                <div className="min-w-0 text-sm font-semibold text-slate-800 break-words">{column.render(row)}</div>
              </div>
            ))}
          </article>
        ))}
        {!data.length ? <div className="px-4 py-10 text-center text-slate-500">{empty}</div> : null}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table className="min-w-full divide-y divide-sky-100 text-left text-sm">
        <thead className="bg-sky-50 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="whitespace-nowrap px-4 py-3 font-bold">{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sky-50">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-sky-50/60">
              {columns.map((column) => (
                <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700">{column.render(row)}</td>
              ))}
            </tr>
          ))}
          {!data.length ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">{empty}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      </div>
    </div>
  );
}
