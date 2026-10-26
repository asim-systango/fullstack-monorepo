'use client';

import { useState } from 'react';
import { EmptyState, Field, Select } from '@shared/ui/components';
import { BalanceEditor } from '@/components/admin';
import { QueryErrorAlert, TableSkeleton } from '@/components/feedback';
import { AppPage } from '@/components/layout';
import { ROLE_LABEL } from '@/lib/auth/routing';
import { useEmployeeBalances, useEmployees } from '@/lib/leave/queries';
import type { Employee } from '@/lib/leave/types';

function BalancesSection({
  employee,
  year,
}: Readonly<{ employee: Employee; year: number }>) {
  const balances = useEmployeeBalances(employee.id, year);

  if (balances.isPending) return <TableSkeleton rows={3} />;
  if (balances.isError) {
    return (
      <QueryErrorAlert error={balances.error} onRetry={() => void balances.refetch()} />
    );
  }
  if (balances.data.length === 0) {
    return (
      <EmptyState
        title="No leave types yet"
        description="Create leave types first, then set balances here."
      />
    );
  }
  return <BalanceEditor balances={balances.data} employee={employee} />;
}

export default function BalancesPage() {
  const thisYear = new Date().getFullYear();
  const years = [thisYear - 1, thisYear, thisYear + 1];
  const employees = useEmployees();
  const [userId, setUserId] = useState('');
  const [year, setYear] = useState(thisYear);
  const employee = employees.data?.find((e) => e.id === userId);

  return (
    <AppPage
      title="Balances"
      description="Pick an employee and a year, then set the total days for each leave type."
    >
      {employees.isError ? (
        <QueryErrorAlert
          error={employees.error}
          onRetry={() => void employees.refetch()}
        />
      ) : null}

      <div className="mb-4 grid max-w-xl gap-3 sm:grid-cols-2">
        <Field label="Employee" htmlFor="balance-employee" className="mb-0">
          <Select
            id="balance-employee"
            value={userId}
            disabled={employees.isPending}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">
              {employees.isPending ? 'Loading…' : 'Choose an employee'}
            </option>
            {(employees.data ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {`${e.name} · ${ROLE_LABEL[e.role]}`}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Year" htmlFor="balance-year" className="mb-0">
          <Select
            id="balance-year"
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {employee ? (
        <BalancesSection employee={employee} year={year} />
      ) : (
        <EmptyState
          title="Pick an employee"
          description="Their balance for each leave type shows up here."
        />
      )}
    </AppPage>
  );
}
