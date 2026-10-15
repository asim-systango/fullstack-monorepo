import React, { useState } from 'react';
import {
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from './table';
import { Pagination } from './pagination';
import { Spinner } from './spinner';
import { EmptyState } from './empty-state';
import { cn } from '../cn';

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface PaginatedTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  keyExtractor?: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
}

export function PaginatedTable<T>({
  columns,
  data,
  pageSize = 10,
  currentPage: externalPage,
  onPageChange: externalOnPageChange,
  keyExtractor,
  isLoading = false,
  emptyState,
  emptyMessage = 'No items found',
  className,
  tableClassName,
}: Readonly<PaginatedTableProps<T>>) {
  const [internalPage, setInternalPage] = useState(1);

  const page = externalPage ?? internalPage;
  const setPage = (newPage: number) => {
    if (externalOnPageChange) {
      externalOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedData =
    externalPage !== undefined
      ? data // assume data passed is already paginated if page is controlled externally with separate data count
      : data.slice((safePage - 1) * pageSize, safePage * pageSize);

  const getKey = (item: T, index: number): string => {
    if (keyExtractor) {
      return String(keyExtractor(item, index));
    }
    if (typeof item === 'object' && item != null && 'id' in item) {
      return String((item as Record<string, unknown>).id);
    }
    return String(index);
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Table className={tableClassName}>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHeaderCell key={idx} className={col.headerClassName}>
                  {col.header}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-12">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Spinner size="md" className="text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Loading records...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (totalItems === 0) {
    if (emptyState) return <>{emptyState}</>;
    return (
      <div className={cn('space-y-4', className)}>
        <Table className={tableClassName}>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHeaderCell key={idx} className={col.headerClassName}>
                  {col.header}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                <div className="py-8">
                  <EmptyState title="No Records" description={emptyMessage} />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Table className={tableClassName}>
        <TableHead>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHeaderCell key={idx} className={col.headerClassName}>
                {col.header}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((item, rowIdx) => {
            const globalIdx = (safePage - 1) * pageSize + rowIdx;
            return (
              <TableRow key={getKey(item, globalIdx)}>
                {columns.map((col, colIdx) => {
                  let content: React.ReactNode = null;
                  if (col.cell) {
                    content = col.cell(item, globalIdx);
                  } else if (
                    col.accessorKey &&
                    typeof item === 'object' &&
                    item != null
                  ) {
                    content = String(item[col.accessorKey] ?? '');
                  }
                  return (
                    <TableCell key={colIdx} className={col.className}>
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Pagination
        currentPage={safePage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
