'use client';

import Link from 'next/link';
import type { Expense, ExpensePage } from '@shared/api-client';
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Form,
  Select,
  Skeleton,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { Avatar } from './avatar';
import { PaginationBar } from './pagination-bar';
import { formatMoney } from '@/lib/format-money';
import type { ExpenseFilter } from '@/lib/store';

type MemberOption = { userId: string; name: string };

type GroupExpensesPanelProps = Readonly<{
  groupId: string;
  currency: string;
  currentUserId?: string;
  members: MemberOption[];
  canMutate: boolean;
  canEdit: boolean;
  showAuditToggle: boolean;
  showAudit: boolean;
  onToggleAudit: () => void;
  filterDraft: ExpenseFilter;
  filterApplied: ExpenseFilter;
  onDraftChange: (patch: Partial<ExpenseFilter>) => void;
  onApply: () => void;
  onClear: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  page: ExpensePage | undefined;
  isLoading: boolean;
  isError: boolean;
  onAdd: () => void;
  onEdit: (expenseId: string) => void;
  onDelete: (expenseId: string) => void;
}>;

function formatExpenseDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function splitSummary(expense: Expense) {
  const participants = expense.shares.filter((s) => s.amountCents > 0);
  if (participants.length === 0) return 'No shares';
  if (participants.length === 1) return '1 person';
  const equal =
    participants.every((s) => s.amountCents === participants[0]?.amountCents) &&
    participants.length > 1;
  return equal
    ? `Split equally · ${participants.length}`
    : `Split · ${participants.length}`;
}

function userShareCents(expense: Expense, userId?: string) {
  if (!userId) return null;
  return expense.shares.find((s) => s.userId === userId)?.amountCents ?? 0;
}

function emptyExpenseAction(args: {
  hasActiveFilters: boolean;
  canMutate: boolean;
  onClear: () => void;
  onAdd: () => void;
}) {
  if (args.hasActiveFilters) {
    return (
      <Button variant="secondary" onClick={args.onClear}>
        Reset filters
      </Button>
    );
  }
  if (args.canMutate) {
    return <Button onClick={args.onAdd}>Add expense</Button>;
  }
  return undefined;
}

function activeFilterChips(
  filter: ExpenseFilter,
  payerLabel?: string,
): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];
  if (filter.q.trim()) chips.push({ key: 'q', label: `Search: ${filter.q.trim()}` });
  if (filter.from) chips.push({ key: 'from', label: `From ${filter.from}` });
  if (filter.to) chips.push({ key: 'to', label: `To ${filter.to}` });
  if (filter.category.trim()) {
    chips.push({ key: 'category', label: `Category: ${filter.category.trim()}` });
  }
  if (filter.payerUserId && payerLabel) {
    chips.push({ key: 'payerUserId', label: `Paid by ${payerLabel}` });
  }
  return chips;
}

export function GroupExpensesPanel(props: GroupExpensesPanelProps) {
  const {
    groupId,
    currency,
    currentUserId,
    members,
    canMutate,
    canEdit,
    showAuditToggle,
    showAudit,
    onToggleAudit,
    filterDraft,
    filterApplied,
    onDraftChange,
    onApply,
    onClear,
    onPageChange,
    onLimitChange,
    page,
    isLoading,
    isError,
    onAdd,
    onEdit,
    onDelete,
  } = props;

  const payerLabel = members.find((m) => m.userId === filterApplied.payerUserId)?.name;
  const chips = activeFilterChips(filterApplied, payerLabel);

  const hasActiveFilters =
    Boolean(filterApplied.from) ||
    Boolean(filterApplied.to) ||
    Boolean(filterApplied.payerUserId) ||
    Boolean(filterApplied.q.trim()) ||
    Boolean(filterApplied.category.trim()) ||
    filterApplied.sortBy !== 'expenseDate' ||
    filterApplied.sortDir !== 'DESC';

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Expenses</h3>
        <div className="flex flex-wrap items-center gap-2">
          {showAuditToggle ? (
            <Button size="sm" variant="ghost" onClick={onToggleAudit}>
              {showAudit ? 'Hide deleted' : 'Show deleted'}
            </Button>
          ) : null}
          {canMutate ? (
            <Button size="sm" onClick={onAdd}>
              Add expense
            </Button>
          ) : null}
        </div>
      </div>

      <Form
        className="rounded-lg border border-border bg-card p-3 splitter-shadow"
        onSubmit={(e) => {
          e.preventDefault();
          onApply();
        }}
      >
        <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Field label="Search" htmlFor="expense-q" className="mb-0">
            <TextInput
              id="expense-q"
              placeholder="Title or description"
              value={filterDraft.q}
              onChange={(e) => onDraftChange({ q: e.target.value })}
            />
          </Field>
          <Field label="From" htmlFor="filter-from" className="mb-0">
            <TextInput
              id="filter-from"
              type="date"
              value={filterDraft.from}
              onChange={(e) => onDraftChange({ from: e.target.value })}
            />
          </Field>
          <Field label="To" htmlFor="filter-to" className="mb-0">
            <TextInput
              id="filter-to"
              type="date"
              value={filterDraft.to}
              onChange={(e) => onDraftChange({ to: e.target.value })}
            />
          </Field>
          <Field label="Payer" htmlFor="filter-payer" className="mb-0">
            <Select
              id="filter-payer"
              value={filterDraft.payerUserId}
              onChange={(e) => onDraftChange({ payerUserId: e.target.value })}
            >
              <option value="">Anyone</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category" htmlFor="filter-category" className="mb-0">
            <TextInput
              id="filter-category"
              placeholder="e.g. Food"
              value={filterDraft.category}
              onChange={(e) => onDraftChange({ category: e.target.value })}
            />
          </Field>
          <Field label="Sort" htmlFor="filter-sort" className="mb-0">
            <Select
              id="filter-sort"
              value={`${filterDraft.sortBy}:${filterDraft.sortDir}`}
              onChange={(e) => {
                const [sortBy, sortDir] = e.target.value.split(':') as [
                  ExpenseFilter['sortBy'],
                  ExpenseFilter['sortDir'],
                ];
                onDraftChange({ sortBy, sortDir });
              }}
            >
              <option value="expenseDate:DESC">Date · newest</option>
              <option value="expenseDate:ASC">Date · oldest</option>
              <option value="amountCents:DESC">Amount · high</option>
              <option value="amountCents:ASC">Amount · low</option>
              <option value="description:ASC">Title · A–Z</option>
              <option value="description:DESC">Title · Z–A</option>
            </Select>
          </Field>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="min-w-[7.5rem]"
            onClick={onClear}
            disabled={!hasActiveFilters}
          >
            Reset
          </Button>
          <Button type="submit" size="sm" className="min-w-[7.5rem]">
            Apply filters
          </Button>
        </div>
      </Form>

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Badge key={`${chip.key}-${chip.label}`} tone="neutral">
              {chip.label}
            </Badge>
          ))}
        </div>
      ) : null}

      {isLoading ? <Skeleton size="lg" className="h-40 rounded-lg" /> : null}
      {isError ? (
        <StatusMessage tone="error">Could not load expenses.</StatusMessage>
      ) : null}

      {!isLoading && !isError && page && page.items.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No matching expenses' : 'No expenses yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting or resetting your filters.'
              : 'When someone adds an expense, it will appear here.'
          }
          action={emptyExpenseAction({ hasActiveFilters, canMutate, onClear, onAdd })}
        />
      ) : null}

      {!isLoading && !isError && page && page.items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card splitter-shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                {canEdit ? <col className="w-[12%]" /> : null}
              </colgroup>
              <thead>
                <tr className="bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Expense</th>
                  <th className="px-4 py-3 text-left font-semibold">Paid by</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Split</th>
                  <th className="px-4 py-3 text-right font-semibold">Your share</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  {canEdit ? (
                    <th className="px-3 py-3 text-right font-semibold">
                      <span className="sr-only">Actions</span>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {page.items.map((expense) => {
                  const share = userShareCents(expense, currentUserId);
                  return (
                    <tr
                      key={expense.id}
                      className="border-t border-border hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 align-middle">
                        <Link
                          href={`/groups/${groupId}/expenses/${expense.id}`}
                          className="block truncate font-medium text-foreground no-underline hover:underline"
                        >
                          {expense.description}
                        </Link>
                        {expense.category ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {expense.category}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="inline-flex max-w-full items-center gap-2">
                          <Avatar name={expense.payer.name} size="sm" />
                          <span className="truncate">{expense.payer.name}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap text-muted-foreground">
                        {formatExpenseDate(expense.expenseDate)}
                      </td>
                      <td className="px-4 py-3 align-middle text-muted-foreground">
                        <span className="block truncate">{splitSummary(expense)}</span>
                      </td>
                      <td className="px-4 py-3 align-middle text-right tabular-nums text-muted-foreground">
                        {share == null ? '—' : formatMoney(share, currency)}
                      </td>
                      <td className="px-4 py-3 align-middle text-right font-semibold tabular-nums">
                        {formatMoney(expense.amountCents, currency)}
                      </td>
                      {canEdit ? (
                        <td className="px-3 py-3 align-middle">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(expense.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(expense.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3">
            <PaginationBar
              page={page.page}
              totalPages={page.totalPages}
              total={page.total}
              limit={page.limit}
              label="expenses"
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
