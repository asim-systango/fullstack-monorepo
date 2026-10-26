'use client';

import { useState, type SyntheticEvent } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Form,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { useToast } from '@/components/feedback';
import { errorMessage, errorStatus, fieldErrors } from '@/lib/leave/errors';
import { useCreateLeaveType, useUpdateLeaveType } from '@/lib/leave/queries';
import type { LeaveType } from '@/lib/leave/types';

type FormProps = Readonly<{ editing: LeaveType | null; onClose: () => void }>;

function LeaveTypeForm({ editing, onClose }: FormProps) {
  const toast = useToast();
  const create = useCreateLeaveType();
  const update = useUpdateLeaveType();
  const [name, setName] = useState(editing?.name ?? '');
  const [days, setDays] = useState(String(editing?.defaultDays ?? 12));

  const pending = create.isPending || update.isPending;
  const error = editing ? update.error : create.error;
  const fields = fieldErrors(error);
  // 409 = a type with this name already exists, show it under the name field
  const nameError = errorStatus(error) === 409 ? errorMessage(error) : fields.name;
  const otherError =
    error && !nameError && !fields.defaultDays ? errorMessage(error) : null;

  function submit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = { name: name.trim(), defaultDays: Number(days) };
    const options = {
      onSuccess: () => {
        toast(editing ? `Saved ${body.name}` : `Created ${body.name}`);
        onClose();
      },
    };
    if (editing) update.mutate({ id: editing.id, ...body }, options);
    else create.mutate(body, options);
  }

  return (
    <Form pending={pending} onSubmit={submit}>
      <DialogHeader>
        <DialogTitle>{editing ? `Edit ${editing.name}` : 'New leave type'}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Field
          label="Name"
          htmlFor="type-name"
          required
          disabled={pending}
          error={nameError}
        >
          <TextInput
            id="type-name"
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field
          label="Default days per year"
          htmlFor="type-days"
          required
          hint="Pre-filled when you set someone's balance"
          disabled={pending}
          error={fields.defaultDays}
        >
          <TextInput
            id="type-days"
            type="number"
            min={0}
            max={366}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </Field>
        {otherError ? <StatusMessage tone="error">{otherError}</StatusMessage> : null}
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" loading={pending}>
          {editing ? 'Save' : 'Create'}
        </Button>
      </DialogFooter>
    </Form>
  );
}

type LeaveTypeDialogProps = Readonly<{
  open: boolean;
  editing: LeaveType | null;
  onClose: () => void;
}>;

export function LeaveTypeDialog({ open, editing, onClose }: LeaveTypeDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      {open ? (
        <LeaveTypeForm key={editing?.id ?? 'new'} editing={editing} onClose={onClose} />
      ) : null}
    </Dialog>
  );
}
