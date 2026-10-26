'use client';

import { Button, Checkbox, Field, Select, TextInput } from '@shared/ui/components';
import { formatDate } from '@/lib/leave/dates';
import { STATUS_LABEL } from '@/lib/leave/format';
import { useLeaveTypes } from '@/lib/leave/queries';
import { LEAVE_STATUSES, type LeaveStatus } from '@/lib/leave/types';
import {
  clearTeamFilters,
  setTeamFilter,
  useAppDispatch,
  useAppSelector,
  type TeamFilter,
} from '@/lib/store';

type Chip = { key: string; label: string; reset: Partial<TeamFilter> };

// the "active filters" line under the filter bar
function activeChips(filter: TeamFilter, typeName: string | undefined): Chip[] {
  const chips: Chip[] = [];
  if (filter.status) {
    chips.push({
      key: 'status',
      label: STATUS_LABEL[filter.status],
      reset: { status: '' },
    });
  }
  if (filter.leaveTypeId) {
    chips.push({
      key: 'type',
      label: typeName ?? 'Leave type',
      reset: { leaveTypeId: '' },
    });
  }
  if (filter.from) {
    chips.push({
      key: 'from',
      label: `From ${formatDate(filter.from)}`,
      reset: { from: '' },
    });
  }
  if (filter.to) {
    chips.push({ key: 'to', label: `To ${formatDate(filter.to)}`, reset: { to: '' } });
  }
  return chips;
}

export function hasBadRange(filter: Pick<TeamFilter, 'from' | 'to'>) {
  return Boolean(filter.from && filter.to && filter.from > filter.to);
}

export function RequestFilters({
  allowDeleted = false,
}: Readonly<{ allowDeleted?: boolean }>) {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.requestFilters.team);
  const leaveTypes = useLeaveTypes();
  const typeName = leaveTypes.data?.find((t) => t.id === filter.leaveTypeId)?.name;
  const chips = activeChips(filter, typeName);
  const update = (patch: Partial<TeamFilter>) => dispatch(setTeamFilter(patch));

  return (
    <div className="mb-4 rounded-lg border border-border bg-card p-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Status" htmlFor="filter-status" className="mb-0">
          <Select
            id="filter-status"
            value={filter.status}
            onChange={(e) => update({ status: e.target.value as LeaveStatus | '' })}
          >
            <option value="">All statuses</option>
            {LEAVE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Leave type" htmlFor="filter-type" className="mb-0">
          <Select
            id="filter-type"
            value={filter.leaveTypeId}
            onChange={(e) => update({ leaveTypeId: e.target.value })}
          >
            <option value="">All types</option>
            {(leaveTypes.data ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="From" htmlFor="filter-from" className="mb-0">
          <TextInput
            id="filter-from"
            type="date"
            value={filter.from}
            onChange={(e) => update({ from: e.target.value })}
          />
        </Field>
        <Field
          label="To"
          htmlFor="filter-to"
          className="mb-0"
          error={hasBadRange(filter) ? '"To" must be on or after "From"' : undefined}
        >
          <TextInput
            id="filter-to"
            type="date"
            value={filter.to}
            min={filter.from || undefined}
            onChange={(e) => update({ to: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {allowDeleted ? (
          <Checkbox
            label="Show deleted"
            checked={filter.includeDeleted}
            onChange={(e) => update({ includeDeleted: e.target.checked })}
            className="mr-3"
          />
        ) : null}
        {chips.length > 0 ? (
          <>
            <span className="text-muted-foreground">Active filters:</span>
            {chips.map((chip) => (
              <Button
                key={chip.key}
                size="sm"
                variant="secondary"
                aria-label={`Remove filter ${chip.label}`}
                onClick={() => update(chip.reset)}
              >
                {`${chip.label} ×`}
              </Button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dispatch(clearTeamFilters())}
            >
              Clear all
            </Button>
          </>
        ) : (
          <span className="text-muted-foreground">No filters, showing every request</span>
        )}
      </div>
    </div>
  );
}
