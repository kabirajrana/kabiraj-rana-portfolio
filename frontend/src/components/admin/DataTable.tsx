import { type ReactNode } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataTableProps<T> {
  rows: T[];
  columns: { key: string; header: string; render: (row: T) => ReactNode }[];
  emptyLabel: string;
}

export function DataTable<T>({ rows, columns, emptyLabel }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70 bg-surface/70">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.render(row)}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-muted">
                {emptyLabel}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
