import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import { formatRange } from '@/lib/leave/dates';
import type { LeaveRequest } from '@/lib/leave/types';
import { StatusBadge } from './status-badge';

type Options = Readonly<{
  showEmployee?: boolean;
  showReason?: boolean;
  detailHref?: (row: LeaveRequest) => string;
  renderActions?: (row: LeaveRequest) => ReactNode;
}>;

type RequestsTableProps = Options &
  Readonly<{
    rows: LeaveRequest[];
    // true while the next page loads (old rows stay visible, just faded)
    stale?: boolean;
  }>;

function RequestRow({
  row,
  showEmployee,
  showReason,
  detailHref,
  renderActions,
}: Options & Readonly<{ row: LeaveRequest }>) {
  const dates = formatRange(row.startDate, row.endDate);
  return (
    <TableRow>
      {showEmployee ? <TableCell>{row.employee.name}</TableCell> : null}
      <TableCell>{row.leaveType.name}</TableCell>
      <TableCell>
        {detailHref ? <Link href={detailHref(row)}>{dates}</Link> : dates}
      </TableCell>
      <TableCell className="text-right tabular-nums">{row.days}</TableCell>
      {showReason ? (
        <TableCell className="max-w-xs truncate" title={row.reason}>
          {row.reason}
        </TableCell>
      ) : null}
      <TableCell>
        <StatusBadge status={row.status} />
      </TableCell>
      {renderActions ? (
        <TableCell>
          <div className="flex justify-end gap-2">{renderActions(row)}</div>
        </TableCell>
      ) : null}
    </TableRow>
  );
}

export function RequestsTable({ rows, stale = false, ...options }: RequestsTableProps) {
  return (
    <Table className={stale ? 'opacity-60' : undefined}>
      <TableHead>
        <TableRow>
          {options.showEmployee ? <TableHeaderCell>Employee</TableHeaderCell> : null}
          <TableHeaderCell>Leave type</TableHeaderCell>
          <TableHeaderCell>Dates</TableHeaderCell>
          <TableHeaderCell className="text-right">Days</TableHeaderCell>
          {options.showReason ? <TableHeaderCell>Reason</TableHeaderCell> : null}
          <TableHeaderCell>Status</TableHeaderCell>
          {options.renderActions ? (
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          ) : null}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <RequestRow key={row.id} row={row} {...options} />
        ))}
      </TableBody>
    </Table>
  );
}
