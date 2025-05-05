
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Column<T> {
  accessorKey?: string;
  id?: string;
  header: React.ReactNode;
  cell?: (info: { row: T }) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={column.id || column.accessorKey || index}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, columnIndex) => {
                const cellValue = column.accessorKey
                  ? row[column.accessorKey as keyof T]
                  : undefined;

                return (
                  <TableCell key={column.id || column.accessorKey || columnIndex}>
                    {column.cell
                      ? column.cell({ row })
                      : cellValue !== undefined
                      ? String(cellValue)
                      : null}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Aucune donnée disponible
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
