'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
} from '@shared/ui/components';
import { useToast } from '@/components/feedback';
import { errorMessage } from '@/lib/leave/errors';
import { plural } from '@/lib/leave/format';
import { useSetBalance } from '@/lib/leave/queries';
import type { Balance, Employee } from '@/lib/leave/types';

const MAX_DAYS = 366;

type RowProps = Readonly<{ balance: Balance; employee: Employee }>;

function BalanceRow({ balance, employee }: RowProps) {
  const toast = useToast();
  const setBalance = useSetBalance();
  // not set yet: start from the leave type's default days
  const [value, setValue] = useState(
    String(balance.configured ? balance.totalDays : balance.defaultDays),
  );
  const total = Number(value);
  const valid =
    value !== '' && Number.isInteger(total) && total >= 0 && total <= MAX_DAYS;
  const unchanged = balance.configured && total === balance.totalDays;

  function save() {
    setBalance.mutate(
      {
        userId: employee.id,
        leaveTypeId: balance.leaveTypeId,
        year: balance.year,
        totalDays: total,
      },
      {
        onSuccess: () =>
          toast(
            `${employee.name}: ${balance.leaveTypeName} set to ${plural(total, 'day')} for ${balance.year}`,
          ),
      },
    );
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          {balance.leaveTypeName}
          {balance.configured ? null : <Badge>Not set</Badge>}
        </div>
      </TableCell>
      <TableCell>
        <TextInput
          type="number"
          min={0}
          max={MAX_DAYS}
          className="w-24"
          aria-label={`${balance.leaveTypeName} total days`}
          value={value}
          invalid={!valid}
          onChange={(e) => {
            setBalance.reset();
            setValue(e.target.value);
          }}
        />
        {setBalance.isError ? (
          <p className="mt-1 mb-0 text-xs text-destructive">
            {errorMessage(setBalance.error)}
          </p>
        ) : null}
      </TableCell>
      <TableCell className="text-right tabular-nums">{balance.usedDays}</TableCell>
      <TableCell className="text-right tabular-nums">{balance.pendingDays}</TableCell>
      <TableCell className="text-right tabular-nums">{balance.availableDays}</TableCell>
      <TableCell>
        <div className="flex justify-end">
          <Button
            size="sm"
            loading={setBalance.isPending}
            disabled={!valid || unchanged}
            onClick={save}
          >
            {balance.configured ? 'Save' : 'Set'}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

type BalanceEditorProps = Readonly<{ balances: Balance[]; employee: Employee }>;

export function BalanceEditor({ balances, employee }: BalanceEditorProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Leave type</TableHeaderCell>
          <TableHeaderCell>Total days</TableHeaderCell>
          <TableHeaderCell className="text-right">Used</TableHeaderCell>
          <TableHeaderCell className="text-right">Pending</TableHeaderCell>
          <TableHeaderCell className="text-right">Left</TableHeaderCell>
          <TableHeaderCell className="text-right">Actions</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {balances.map((balance) => (
          // the key changes when the server value changes, so the input resets to it
          <BalanceRow
            key={`${employee.id}-${balance.year}-${balance.leaveTypeId}-${balance.configured}-${balance.totalDays}`}
            balance={balance}
            employee={employee}
          />
        ))}
      </TableBody>
    </Table>
  );
}
