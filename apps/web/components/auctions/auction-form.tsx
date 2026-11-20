'use client';

import { useState, type SyntheticEvent } from 'react';
import { ApiClientError } from '@shared/api-client';
import {
  Alert,
  Button,
  Field,
  Form,
  Select,
  StatusMessage,
  TextArea,
  TextInput,
} from '@shared/ui/components';
import { AUCTION_CATEGORIES } from '@/lib/auction-utils';
import type { Auction, CreateAuctionInput } from '@/lib/schemas/auction';

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultEndsAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return toLocalInputValue(d.toISOString());
}

export type AuctionFormProps = Readonly<{
  initial?: Auction;
  locked?: boolean;
  lockReason?: string;
  submitLabel: string;
  onSubmit: (input: CreateAuctionInput) => Promise<void>;
}>;

export function AuctionForm({
  initial,
  locked = false,
  lockReason,
  submitLabel,
  onSubmit,
}: AuctionFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'electronics');
  const [startingPrice, setStartingPrice] = useState(
    initial ? String(Number(initial.startingPrice)) : '',
  );
  const [minIncrement, setMinIncrement] = useState(
    initial ? String(Number(initial.minIncrement)) : '',
  );
  const [endsAt, setEndsAt] = useState(
    initial ? toLocalInputValue(initial.endsAt) : defaultEndsAt(),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (locked) return;

    const start = Number(startingPrice);
    const increment = Number(minIncrement);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!Number.isFinite(start) || start < 0.01) {
      setError('Starting price must be at least 0.01');
      return;
    }
    if (!Number.isFinite(increment) || increment < 0.01) {
      setError('Minimum increment must be at least 0.01');
      return;
    }
    const ends = new Date(endsAt);
    if (Number.isNaN(ends.getTime()) || ends.getTime() <= Date.now()) {
      setError('End time must be in the future');
      return;
    }

    setPending(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        startingPrice: start,
        minIncrement: increment,
        endsAt: ends.toISOString(),
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not save auction');
    } finally {
      setPending(false);
    }
  }

  const disabled = pending || locked;

  return (
    <Form pending={pending} onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {locked && lockReason ? (
        <Alert tone="info" title="Editing locked">
          {lockReason}
        </Alert>
      ) : null}
      <Field label="Title" htmlFor="auction-title" required disabled={disabled}>
        <TextInput
          id="auction-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Field>
      <Field label="Description" htmlFor="auction-description" disabled={disabled}>
        <TextArea
          id="auction-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </Field>
      <Field label="Category" htmlFor="auction-category" required disabled={disabled}>
        <Select
          id="auction-category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {AUCTION_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Starting price (₹)"
        htmlFor="auction-starting"
        required
        disabled={disabled}
      >
        <TextInput
          id="auction-starting"
          name="startingPrice"
          type="number"
          min={0.01}
          step="0.01"
          value={startingPrice}
          onChange={(e) => setStartingPrice(e.target.value)}
        />
      </Field>
      <Field
        label="Minimum increment (₹)"
        htmlFor="auction-increment"
        required
        disabled={disabled}
      >
        <TextInput
          id="auction-increment"
          name="minIncrement"
          type="number"
          min={0.01}
          step="0.01"
          value={minIncrement}
          onChange={(e) => setMinIncrement(e.target.value)}
        />
      </Field>
      <Field label="Ends at" htmlFor="auction-ends" required disabled={disabled}>
        <TextInput
          id="auction-ends"
          name="endsAt"
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
        />
      </Field>
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      <Button type="submit" loading={pending} loadingText="Saving…" disabled={locked}>
        {submitLabel}
      </Button>
    </Form>
  );
}
