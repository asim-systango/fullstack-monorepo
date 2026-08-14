'use client';

import { useState } from 'react';
import type { MemberListItem } from '@shared/types';
import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  TextArea,
} from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import { useReinstateMember, useSuspendMember } from '@/lib/bookly';

export function AdminMemberRow({ member }: Readonly<{ member: MemberListItem }>) {
  const suspend = useSuspendMember();
  const reinstate = useReinstateMember();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reinstateOpen, setReinstateOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isSuspended = member.status === 'suspended';
  const pending = suspend.isPending || reinstate.isPending;

  async function onSuspend() {
    setError(null);
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('A reason is required to suspend a member.');
      return;
    }
    try {
      await suspend.mutateAsync({ userId: member.userId, input: { reason: trimmed } });
      setSuspendOpen(false);
      setReason('');
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  async function onReinstate() {
    setError(null);
    try {
      await reinstate.mutateAsync(member.userId);
      setReinstateOpen(false);
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  return (
    <li className="admin-row">
      <div className="min-w-0 flex-1">
        <p className="m-0 font-medium text-[color:var(--bookly-navy)]">
          {member.fullName}
        </p>
        <p className="m-0 truncate text-sm text-[color:var(--bookly-muted)]">
          {member.email}
        </p>
        <p className="m-0 mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[color:var(--bookly-muted)]">
          <span
            className={`admin-status-chip ${
              isSuspended ? 'admin-status-suspended' : 'admin-status-active'
            }`}
          >
            {isSuspended ? 'Suspended' : 'Active'}
          </span>
          <span>
            {member.activeLoanCount} active loan{member.activeLoanCount === 1 ? '' : 's'}
          </span>
        </p>
      </div>
      <div className="shrink-0">
        {isSuspended ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => {
              setError(null);
              setReinstateOpen(true);
            }}
          >
            Reinstate
          </Button>
        ) : (
          <Button
            variant="danger"
            size="sm"
            disabled={pending}
            onClick={() => {
              setError(null);
              setReason('');
              setSuspendOpen(true);
            }}
          >
            Suspend
          </Button>
        )}
      </div>

      <Dialog
        open={suspendOpen}
        onOpenChange={(open) => {
          setSuspendOpen(open);
          if (!open) {
            setReason('');
            setError(null);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Suspend member?</DialogTitle>
          <DialogDescription>
            Suspended members cannot use the library until they are reinstated.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor={`suspend-reason-${member.id}`}
          >
            Reason
          </label>
          <TextArea
            id={`suspend-reason-${member.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Explain why this member is being suspended"
            disabled={suspend.isPending}
          />
          {error ? (
            <Alert tone="danger" title="Could not suspend member" className="mt-3">
              {error}
            </Alert>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            disabled={suspend.isPending}
            onClick={() => setSuspendOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={suspend.isPending || !reason.trim()}
            onClick={() => void onSuspend()}
          >
            {suspend.isPending ? 'Suspending…' : 'Suspend member'}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={reinstateOpen}
        onOpenChange={(open) => {
          setReinstateOpen(open);
          if (!open) setError(null);
        }}
      >
        <DialogHeader>
          <DialogTitle>Reinstate member?</DialogTitle>
          <DialogDescription>
            {member.fullName} will regain access to library services.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {error ? (
            <Alert tone="danger" title="Could not reinstate member">
              {error}
            </Alert>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            disabled={reinstate.isPending}
            onClick={() => setReinstateOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={reinstate.isPending}
            onClick={() => void onReinstate()}
          >
            {reinstate.isPending ? 'Reinstating…' : 'Reinstate member'}
          </Button>
        </DialogFooter>
      </Dialog>
    </li>
  );
}
