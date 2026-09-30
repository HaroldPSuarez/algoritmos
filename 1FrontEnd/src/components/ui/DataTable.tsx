// src/components/ui/DataTable.tsx
import type { ReactNode } from "react";
import "./DataTable.css";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: (row: T) => string | number;
  emptyLabel?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyField,
  emptyLabel = "Sin registros todavía",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <p className="data-table__empty">{emptyLabel}</p>;
  }

  return (
    <div className="data-table">
      {/* Encabezado visible solo en escritorio */}
      <div className="data-table__head" role="row">
        {columns.map((col) => (
          <div key={col.header} className="data-table__cell data-table__cell--head">
            {col.header}
          </div>
        ))}
      </div>

      {data.map((row) => (
        <div className="data-table__row" role="row" key={keyField(row)}>
          {columns.map((col) => (
            <div key={col.header} className="data-table__cell" data-label={col.header}>
              {col.render(row)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}