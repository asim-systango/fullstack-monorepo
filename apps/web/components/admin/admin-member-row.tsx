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
import { ROLES } from '@/lib/auth/roles';
import { useReinstateMember, useSuspendMember, useUpdateUserRole } from '@/lib/bookly';

function MemberRowChips({ member }: Readonly<{ member: MemberListItem }>) {
  const isSuspended = member.status === 'suspended';
  return (
    <p className="m-0 mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[color:var(--bookly-muted)]">
      <span
        className={`admin-status-chip ${
          isSuspended ? 'admin-status-suspended' : 'admin-status-active'
        }`}
      >
        {isSuspended ? 'Suspended' : 'Active'}
      </span>
      {member.role !== ROLES.user ? (
        <span className="admin-status-chip admin-status-active">
          {member.role === ROLES.staff ? 'Staff' : 'Admin'}
        </span>
      ) : null}
      <span>
        {member.activeLoanCount} active loan{member.activeLoanCount === 1 ? '' : 's'}
      </span>
    </p>
  );
}

export function AdminMemberRow({ member }: Readonly<{ member: MemberListItem }>) {
  const suspend = useSuspendMember();
  const reinstate = useReinstateMember();
  const promote = useUpdateUserRole();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reinstateOpen, setReinstateOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [promoteSuccess, setPromoteSuccess] = useState<string | null>(null);

  const isSuspended = member.status === 'suspended';
  const canPromote = member.role === ROLES.user && !isSuspended;
  const pending = suspend.isPending || reinstate.isPending || promote.isPending;

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

  async function onPromote() {
    setError(null);
    try {
      await promote.mutateAsync({ id: member.userId, role: 'staff' });
      setPromoteOpen(false);
      setPromoteSuccess(
        'Promoted to staff. A temporary password was emailed — they must change it after login.',
      );
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
        <MemberRowChips member={member} />
        {promoteSuccess ? (
          <p className="m-0 mt-2 text-sm text-[color:var(--bookly-navy)]">{promoteSuccess}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {canPromote ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => {
              setError(null);
              setPromoteOpen(true);
            }}
          >
            Promote to Staff
          </Button>
        ) : null}
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
        open={promoteOpen}
        onOpenChange={(open) => {
          setPromoteOpen(open);
          if (!open) setError(null);
        }}
      >
        <DialogHeader>
          <DialogTitle>Promote to staff?</DialogTitle>
          <DialogDescription>
            {member.fullName} will become Librarian/Staff. Their member profile stays
            unchanged. BOOKLY will email a temporary password that they must change after
            logging in.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {error ? (
            <Alert tone="danger" title="Could not promote member">
              {error}
            </Alert>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            disabled={promote.isPending}
            onClick={() => setPromoteOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={promote.isPending}
            onClick={() => void onPromote()}
          >
            {promote.isPending ? 'Promoting…' : 'Promote to Staff'}
          </Button>
        </DialogFooter>
      </Dialog>

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
