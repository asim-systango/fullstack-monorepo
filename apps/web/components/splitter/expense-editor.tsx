'use client';

import { useMemo, useState, type SyntheticEvent } from 'react';
import {
  Button,
  Checkbox,
  Field,
  Form,
  Select,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import type { CreateExpenseInput } from '@shared/api-client';
import { formatMoney } from '@/lib/format-money';
import { centsToInput, parseMoneyToCents, shareSum, splitEqually } from '@/lib/split';

export type ExpenseEditorMember = {
  userId: string;
  name: string;
};

export type ExpenseEditorInitial = {
  description: string;
  amountCents: number;
  payerUserId: string;
  category: string;
  expenseDate: string;
  shares: { userId: string; amountCents: number }[];
};

type ExpenseEditorProps = Readonly<{
  members: ExpenseEditorMember[];
  currency: string;
  currentUserId: string;
  initial?: ExpenseEditorInitial;
  pending: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (input: CreateExpenseInput) => void;
  onCancel: () => void;
}>;

function toDateInput(iso: string) {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return iso.slice(0, 10);
}

function initialIncluded(members: ExpenseEditorMember[], initial?: ExpenseEditorInitial) {
  if (!initial) return new Set(members.map((m) => m.userId));
  const withShare = initial.shares.filter((s) => s.amountCents > 0).map((s) => s.userId);
  if (withShare.length > 0) return new Set(withShare);
  return new Set(members.map((m) => m.userId));
}

export function ExpenseEditor({
  members,
  currency,
  currentUserId,
  initial,
  pending,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: ExpenseEditorProps) {
  const defaultPayer =
    initial?.payerUserId ??
    (members.some((m) => m.userId === currentUserId)
      ? currentUserId
      : (members[0]?.userId ?? ''));

  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial ? centsToInput(initial.amountCents) : '');
  const [payerUserId, setPayerUserId] = useState(defaultPayer);
  const [category, setCategory] = useState(initial?.category ?? '');
  const [expenseDate, setExpenseDate] = useState(toDateInput(initial?.expenseDate ?? ''));
  const [includedIds, setIncludedIds] = useState<Set<string>>(() =>
    initialIncluded(members, initial),
  );
  const [shareInputs, setShareInputs] = useState<Record<string, string>>(() => {
    const next: Record<string, string> = {};
    for (const member of members) {
      const share = initial?.shares.find((s) => s.userId === member.userId);
      next[member.userId] = share ? centsToInput(share.amountCents) : '0.00';
    }
    return next;
  });

  const includedMembers = members.filter((m) => includedIds.has(m.userId));
  const amountCents = parseMoneyToCents(amount);
  const shares = includedMembers.map((member) => ({
    userId: member.userId,
    amountCents: parseMoneyToCents(shareInputs[member.userId] ?? '0') ?? 0,
  }));
  const totalShares = shareSum(shares);
  const noneSelected = includedMembers.length === 0;
  const mismatch =
    noneSelected || amountCents == null || amountCents < 1 || totalShares !== amountCents;

  const hint = useMemo(() => {
    if (noneSelected) return 'Select at least one member to split with.';
    if (amountCents == null || amountCents < 1)
      return 'Enter an amount of at least 0.01.';
    if (totalShares === amountCents) {
      return `Split among ${includedMembers.length} · total ${formatMoney(amountCents, currency)}.`;
    }
    const delta = totalShares - amountCents;
    const abs = formatMoney(Math.abs(delta), currency);
    return delta > 0
      ? `Splits are ${abs} over the total.`
      : `Splits are ${abs} under the total.`;
  }, [noneSelected, amountCents, totalShares, currency, includedMembers.length]);

  function toggleIncluded(userId: string, checked: boolean) {
    setIncludedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(userId);
      else next.delete(userId);
      return next;
    });
    if (!checked) {
      setShareInputs((prev) => ({ ...prev, [userId]: '0.00' }));
    }
  }

  function applyEqualSplit() {
    if (amountCents == null || amountCents < 1 || includedMembers.length === 0) return;
    const parts = splitEqually(amountCents, includedMembers.length);
    setShareInputs((prev) => {
      const next = { ...prev };
      for (const member of members) {
        if (!includedIds.has(member.userId)) next[member.userId] = '0.00';
      }
      includedMembers.forEach((member, i) => {
        next[member.userId] = centsToInput(parts[i] ?? 0);
      });
      return next;
    });
  }

  function onFormSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mismatch || amountCents == null) return;
    onSubmit({
      description: description.trim(),
      amountCents,
      payerUserId,
      category: category.trim() || undefined,
      expenseDate: new Date(`${expenseDate}T12:00:00`).toISOString(),
      shares,
    });
  }

  return (
    <Form pending={pending} onSubmit={onFormSubmit} className="space-y-4">
      <Field label="Description" htmlFor="expense-desc" required>
        <TextInput
          id="expense-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dinner, rent, groceries…"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount" htmlFor="expense-amount" required>
          <TextInput
            id="expense-amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label="Date" htmlFor="expense-date" required>
          <TextInput
            id="expense-date"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Paid by" htmlFor="expense-payer" required>
          <Select
            id="expense-payer"
            value={payerUserId}
            onChange={(e) => setPayerUserId(e.target.value)}
          >
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Category" htmlFor="expense-category">
          <TextInput
            id="expense-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Food, rent…"
          />
        </Field>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Split with</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={applyEqualSplit}
            disabled={noneSelected}
          >
            Split equally
          </Button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          Uncheck anyone who should not share this expense.
        </p>
        <ul className="space-y-2">
          {members.map((member) => {
            const included = includedIds.has(member.userId);
            return (
              <li key={member.userId} className="flex items-center gap-3">
                <Checkbox
                  label={member.name}
                  checked={included}
                  onChange={(e) => toggleIncluded(member.userId, e.target.checked)}
                  className="min-w-0 flex-1"
                />
                <TextInput
                  aria-label={`Share for ${member.name}`}
                  className="w-28"
                  inputMode="decimal"
                  disabled={!included}
                  value={shareInputs[member.userId] ?? '0.00'}
                  onChange={(e) =>
                    setShareInputs((prev) => ({
                      ...prev,
                      [member.userId]: e.target.value,
                    }))
                  }
                />
              </li>
            );
          })}
        </ul>
        <p
          className={`mt-2 text-sm ${mismatch ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {hint}
        </p>
      </div>

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

      <div className="flex gap-2">
        <Button
          type="submit"
          loading={pending}
          disabled={mismatch || !description.trim()}
        >
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Form>
  );
}
