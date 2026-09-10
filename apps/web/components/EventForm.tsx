'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button, Field, Form, Select, TextArea, TextInput } from '@shared/ui/components';
import type { CreateEventInput } from '@/hooks/useEvents';

interface EventFormProps {
  initialValues?: Partial<CreateEventInput>;
  onSubmit: (values: CreateEventInput) => void;
  pending?: boolean;
  submitText?: string;
  disableStatus?: boolean;
}

const CATEGORIES = ['Technology', 'Workshop', 'Design', 'Security', 'Business', 'General'];

export function EventForm({
  initialValues,
  onSubmit,
  pending = false,
  submitText = 'Save Event',
  disableStatus = false,
}: EventFormProps) {
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'CANCELLED'>(
    initialValues?.status || 'PUBLISHED',
  );
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [location, setLocation] = useState(initialValues?.location || '');
  const [category, setCategory] = useState(initialValues?.category || 'Technology');
  const [capacity, setCapacity] = useState<number | string>(initialValues?.capacity ?? '');

  const [startDate, setStartDate] = useState(
    initialValues?.startDate
      ? new Date(initialValues.startDate).toISOString().slice(0, 16)
      : '',
  );
  const [endDate, setEndDate] = useState(
    initialValues?.endDate
      ? new Date(initialValues.endDate).toISOString().slice(0, 16)
      : '',
  );

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      setCapacity('');
      return;
    }
    // Remove leading zeros (e.g., "0110" -> "110")
    const sanitized = rawVal.replace(/^0+(?=\d)/, '');
    const num = parseInt(sanitized, 10);
    if (!isNaN(num)) {
      setCapacity(num);
    }
  };

  const handleCapacityBlur = () => {
    if (capacity !== '' && Number(capacity) < 1) {
      setCapacity(1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCapacity = Math.max(1, Number(capacity) || 1);

    const payload: CreateEventInput = {
      title,
      description,
      location,
      capacity: finalCapacity,
      category,
      status,
    };

    if (startDate && startDate.trim() !== '') {
      payload.startDate = new Date(startDate).toISOString();
    }
    if (endDate && endDate.trim() !== '') {
      payload.endDate = new Date(endDate).toISOString();
    }

    onSubmit(payload);
  };

  return (
    <Form onSubmit={handleSubmit} pending={pending} className="space-y-5">
      {/* Event Publication Status Selection (Selected First) */}
      <div className="rounded-xl border border-border/80 bg-secondary/20 p-4 space-y-2">
        <Field label="Event Status / Publication Type" htmlFor="status" disabled={pending || disableStatus}>
          <Select
            id="status"
            name="status"
            value={status}
            disabled={pending || disableStatus}
            onChange={(e) => {
              setStatus(e.target.value as 'DRAFT' | 'PUBLISHED' | 'CANCELLED');
            }}
            className="font-semibold"
          >
            <option value="PUBLISHED">Published (Publicly Visible)</option>
            <option value="DRAFT">Draft (Save draft without required dates)</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </Field>
        {status === 'DRAFT' && (
          <p className="flex items-center text-xs text-amber-500 font-medium">
            <Info className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span>Draft Mode active: Start and End schedule dates are optional. You can set them when publishing later.</span>
          </p>
        )}
      </div>

      <Field label="Event Title" htmlFor="title" required disabled={pending}>
        <TextInput
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Annual Tech Summit 2026"
          required
        />
      </Field>

      <Field label="Description" htmlFor="description" required disabled={pending}>
        <TextArea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide a detailed overview of the event, keynotes, schedule..."
          rows={4}
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Location / Venue" htmlFor="location" required disabled={pending}>
          <TextInput
            id="location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Convention Center Hall B / Online"
            required
          />
        </Field>

        <Field label="Category" htmlFor="category" disabled={pending}>
          <Select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field
          label="Start Date & Time"
          htmlFor="startDate"
          required={status === 'PUBLISHED'}
          optional={status === 'DRAFT'}
          disabled={pending}
        >
          <TextInput
            id="startDate"
            name="startDate"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required={status === 'PUBLISHED'}
          />
        </Field>

        <Field
          label="End Date & Time"
          htmlFor="endDate"
          required={status === 'PUBLISHED'}
          optional={status === 'DRAFT'}
          disabled={pending}
        >
          <TextInput
            id="endDate"
            name="endDate"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required={status === 'PUBLISHED'}
          />
        </Field>

        <Field label="Seat Capacity" htmlFor="capacity" required disabled={pending}>
          <TextInput
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={handleCapacityChange}
            onBlur={handleCapacityBlur}
            required
          />
        </Field>
      </div>

      <Button type="submit" loading={pending} loadingText="Saving..." className="w-full font-semibold">
        {submitText}
      </Button>
    </Form>
  );
}
