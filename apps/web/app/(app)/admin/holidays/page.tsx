'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import { HolidayForm } from '@/components/admin';
import {
  ConfirmDialog,
  QueryErrorAlert,
  TableSkeleton,
  useToast,
} from '@/components/feedback';
import { AppPage } from '@/components/layout';
import { formatDate, isWeekend, weekdayShort } from '@/lib/leave/dates';
import { errorMessage } from '@/lib/leave/errors';
import { useDeleteHoliday, useHolidays } from '@/lib/leave/queries';
import type { Holiday } from '@/lib/leave/types';

type RowProps = Readonly<{ holiday: Holiday; onDelete: (holiday: Holiday) => void }>;

function HolidayRow({ holiday, onDelete }: RowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          {`${weekdayShort(holiday.date)} ${formatDate(holiday.date)}`}
          {isWeekend(holiday.date) ? <Badge>Weekend</Badge> : null}
        </div>
      </TableCell>
      <TableCell>{holiday.name}</TableCell>
      <TableCell>
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={() => onDelete(holiday)}>
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function HolidaysPage() {
  const toast = useToast();
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const holidays = useHolidays(year);
  const remove = useDeleteHoliday();
  const [toDelete, setToDelete] = useState<Holiday | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null);
        toast(`${name} removed`);
      },
    });
  }

  function renderList() {
    if (holidays.isPending) return <TableSkeleton rows={4} />;
    if (holidays.isError) {
      return (
        <QueryErrorAlert error={holidays.error} onRetry={() => void holidays.refetch()} />
      );
    }
    if (holidays.data.length === 0) {
      return (
        <EmptyState
          title={`No public holidays for ${year}`}
          description="Add one above and it is skipped when counting working days."
        />
      );
    }
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holidays.data.map((holiday) => (
            <HolidayRow key={holiday.id} holiday={holiday} onDelete={setToDelete} />
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <AppPage
      title="Public holidays"
      description="These dates are skipped when counting working days. Pending requests are recounted when approved, decided ones keep their day count."
    >
      <HolidayForm />

      <div className="mt-8 mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 className="m-0 text-base font-semibold text-foreground">{`Holidays in ${year}`}</h2>
        <Field label="Year" htmlFor="holiday-year" className="mb-0 w-32">
          <Select
            id="holiday-year"
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[thisYear - 1, thisYear, thisYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {renderList()}

      <ConfirmDialog
        open={toDelete !== null}
        title={`Remove ${toDelete?.name ?? 'this holiday'}?`}
        description="New and pending requests over this date will count it as a working day again."
        confirmLabel="Remove"
        danger
        pending={remove.isPending}
        error={remove.isError ? errorMessage(remove.error) : null}
        onConfirm={confirmDelete}
        onClose={() => {
          remove.reset();
          setToDelete(null);
        }}
      />
    </AppPage>
  );
}
