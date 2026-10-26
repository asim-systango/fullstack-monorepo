'use client';

import { useState, type SyntheticEvent } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Form,
  StatusMessage,
  TextArea,
} from '@shared/ui/components';
import { formatRange } from '@/lib/leave/dates';
import { plural } from '@/lib/leave/format';
import type { LeaveRequest } from '@/lib/leave/types';

export type DecisionTarget = { request: LeaveRequest; decision: 'approve' | 'reject' };

type FormProps = Readonly<{
  target: DecisionTarget;
  pending: boolean;
  error: string | null;
  onSubmit: (comment: string) => void;
  onClose: () => void;
}>;

function DecisionForm({ target, pending, error, onSubmit, onClose }: FormProps) {
  const [comment, setComment] = useState('');
  const [missing, setMissing] = useState(false);
  const { request } = target;
  const isReject = target.decision === 'reject';

  function submit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    // brief: reject needs a comment (the API checks this too)
    if (isReject && !comment.trim()) {
      setMissing(true);
      return;
    }
    onSubmit(comment.trim());
  }

  return (
    // noValidate: show our own styled message instead of the browser's tooltip
    <Form pending={pending} onSubmit={submit} noValidate>
      <DialogHeader>
        <DialogTitle>{`${isReject ? 'Reject' : 'Approve'} ${request.employee.name}'s leave?`}</DialogTitle>
        <DialogDescription>
          {`${request.leaveType.name} · ${formatRange(request.startDate, request.endDate)} · ${plural(request.days, 'working day')}`}
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <p className="mt-0 text-sm text-muted-foreground">
          {isReject
            ? "Their balance won't change."
            : `${plural(request.days, 'day')} will be taken from their ${request.leaveType.name} balance.`}
        </p>
        <p className="mt-1 mb-3 text-sm">{`Reason: ${request.reason}`}</p>
        <Field
          label={isReject ? 'Comment for the employee' : 'Comment'}
          htmlFor="decision-comment"
          required={isReject}
          optional={!isReject}
          disabled={pending}
          error={missing ? 'A comment is required when rejecting' : undefined}
        >
          <TextArea
            id="decision-comment"
            rows={3}
            maxLength={500}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setMissing(false);
            }}
          />
        </Field>
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Back
        </Button>
        <Button type="submit" variant={isReject ? 'danger' : 'primary'} loading={pending}>
          {isReject ? 'Reject' : 'Approve'}
        </Button>
      </DialogFooter>
    </Form>
  );
}

type DecisionDialogProps = Readonly<{
  target: DecisionTarget | null;
  pending: boolean;
  error: string | null;
  onSubmit: (comment: string) => void;
  onClose: () => void;
}>;

export function DecisionDialog({ target, ...rest }: DecisionDialogProps) {
  return (
    <Dialog
      open={target !== null}
      onOpenChange={(next) => {
        if (!next && !rest.pending) rest.onClose();
      }}
    >
      {/* the kit's dialog stays mounted, the key gives every request a fresh empty comment */}
      {target ? (
        <DecisionForm
          key={`${target.request.id}-${target.decision}`}
          target={target}
          {...rest}
        />
      ) : null}
    </Dialog>
  );
}
