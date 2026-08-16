'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Alert,
  Button,
  Field,
  Select,
  Skeleton,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { RequireRole } from '@/components/dashboard/require-role';
import { StaffPageHeader } from '@/components/staff';
import { toUserMessage } from '@/lib/auth/errors';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { ROUTES } from '@/lib/auth/routes';
import {
  useBookCopies,
  useCheckoutRequest,
  useIssueCheckoutRequest,
  useRejectCheckoutRequest,
} from '@/lib/bookly';
import { formatDateTime } from '@/lib/member';

function IssueCheckoutRequestContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const isStaff = hasRole(user, [ROLES.staff]);
  const requestQuery = useCheckoutRequest(id);
  const request = requestQuery.data;
  const copies = useBookCopies(request?.bookId);
  const issue = useIssueCheckoutRequest();
  const reject = useRejectCheckoutRequest();

  const availableCopies =
    copies.data?.filter((copy) => copy.status === 'available' && !copy.deletedAt) ?? [];
  const issuedCopies =
    copies.data?.filter((copy) => copy.status !== 'available' && !copy.deletedAt) ?? [];

  const [copyId, setCopyId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (request?.suggestedDueDate && !dueDate) {
      setDueDate(request.suggestedDueDate);
    }
  }, [request?.suggestedDueDate, dueDate]);

  useEffect(() => {
    if (!copyId && availableCopies[0]) {
      setCopyId(availableCopies[0].id);
    }
  }, [availableCopies, copyId]);

  async function onIssue() {
    if (!id) return;
    setError(null);
    setSuccess(null);
    if (!copyId) {
      setError('Select an available copy before issuing.');
      return;
    }
    try {
      await issue.mutateAsync({
        id,
        input: { bookCopyId: copyId, dueDate: dueDate || undefined },
      });
      setSuccess(
        'Book issued successfully.\nThe member has been notified by email.',
      );
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  async function onReject() {
    if (!id) return;
    setError(null);
    setSuccess(null);
    try {
      await reject.mutateAsync({
        id,
        input: rejectReason.trim() ? { reason: rejectReason.trim() } : undefined,
      });
      setSuccess('Request rejected.');
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  if (requestQuery.isPending) {
    return (
      <div className="staff-content space-y-4">
        <Skeleton />
        <Skeleton size="lg" />
      </div>
    );
  }

  if (requestQuery.isError || !request) {
    return (
      <div className="staff-content space-y-4">
        <Alert tone="danger" title="Could not load this request">
          {toUserMessage(requestQuery.error)}
        </Alert>
        <Link href={ROUTES.librarianCheckoutRequests} className="text-sm font-medium">
          ← Back to checkout requests
        </Link>
      </div>
    );
  }

  const canIssue = isStaff && request.status === 'pending';
  const issued = request.status === 'fulfilled';

  return (
    <div className="staff-content space-y-4">
      <Link
        href={ROUTES.librarianCheckoutRequests}
        className="inline-block text-sm font-medium text-[color:var(--bookly-navy)] no-underline hover:underline"
      >
        ← Back to checkout requests
      </Link>

      <StaffPageHeader
        title={issued ? 'Book issued' : 'Issue book'}
        description="Select an available copy of this title. The member requested the title, not a specific copy."
      />

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {success ? (
        <StatusMessage tone="success">
          <span className="whitespace-pre-line">{success}</span>
        </StatusMessage>
      ) : null}

      <section className="staff-card staff-card-primary p-4">
        <h2 className="staff-section-title">Member</h2>
        <p className="m-0 mt-2 font-medium text-[color:var(--bookly-navy)]">
          {request.member?.fullName ?? 'Member'}
        </p>
        {request.member?.email ? (
          <p className="mt-1 mb-0 text-sm text-[color:var(--bookly-muted)]">
            {request.member.email}
          </p>
        ) : null}
        <p className="mt-1 mb-0 text-sm text-[color:var(--bookly-muted)]">
          Status: {request.member?.status ?? 'unknown'}
        </p>
      </section>

      <section className="staff-card p-4">
        <h2 className="staff-section-title">Book</h2>
        <p className="m-0 mt-2 font-medium text-[color:var(--bookly-navy)]">
          {request.book.title}
        </p>
        <p className="mt-1 mb-0 text-sm text-[color:var(--bookly-muted)]">
          {request.book.author}
        </p>
        <p className="mt-1 mb-0 text-sm text-[color:var(--bookly-muted)]">
          Requested {formatDateTime(request.createdAt)} · {request.status}
        </p>
      </section>

      {issued && request.loan ? (
        <Alert tone="success" title="Fulfilled / Issued">
          Issued {request.loan.borrowedAt.slice(0, 10)} · Due {request.loan.dueDate}
        </Alert>
      ) : null}

      {canIssue ? (
        <IssuePanel
          copiesPending={copies.isPending}
          copiesError={copies.error}
          copiesFailed={copies.isError}
          availableCopies={availableCopies}
          issuedCopies={issuedCopies}
          copyId={copyId}
          dueDate={dueDate}
          issuePending={issue.isPending}
          rejectPending={reject.isPending}
          onCopyId={setCopyId}
          onDueDate={setDueDate}
          onIssue={() => void onIssue()}
        />
      ) : null}

      {canIssue ? (
        <RejectPanel
          rejectReason={rejectReason}
          issuePending={issue.isPending}
          rejectPending={reject.isPending}
          onRejectReason={setRejectReason}
          onReject={() => void onReject()}
        />
      ) : null}

      {!isStaff && request.status === 'pending' ? (
        <Alert tone="info" title="Staff only">
          Issuing and rejecting checkout requests are staff desk operations.
        </Alert>
      ) : null}
    </div>
  );
}

type AvailableCopy = {
  id: string;
  barcode: string;
  status: string;
};

function IssuePanel({
  copiesPending,
  copiesError,
  copiesFailed,
  availableCopies,
  issuedCopies,
  copyId,
  dueDate,
  issuePending,
  rejectPending,
  onCopyId,
  onDueDate,
  onIssue,
}: Readonly<{
  copiesPending: boolean;
  copiesError: unknown;
  copiesFailed: boolean;
  availableCopies: AvailableCopy[];
  issuedCopies: AvailableCopy[];
  copyId: string;
  dueDate: string;
  issuePending: boolean;
  rejectPending: boolean;
  onCopyId: (value: string) => void;
  onDueDate: (value: string) => void;
  onIssue: () => void;
}>) {
  return (
    <section className="staff-card staff-card-operational p-4">
      <div className="staff-form-stack">
        <div>
          <h2 className="staff-section-title">Issue a copy</h2>
          <p className="staff-section-desc">
            Select an available barcode. Each barcode is one physical copy you can issue.
          </p>
        </div>

      {copiesPending ? <Skeleton /> : null}
      {copiesFailed ? (
        <Alert tone="danger" title="Could not load copies">
          {toUserMessage(copiesError)}
        </Alert>
      ) : null}

      {!copiesPending && !copiesFailed && availableCopies.length === 0 ? (
        <Alert tone="danger" title="No copies available">
          This title has no available copies right now. Reject the request or wait for a
          return.
        </Alert>
      ) : null}

      {availableCopies.length > 0 ? (
        <Field label="Physical copy barcode" htmlFor="issue-copy">
          <Select
            id="issue-copy"
            value={copyId}
            onChange={(event) => onCopyId(event.target.value)}
            disabled={issuePending}
          >
            {availableCopies.map((copy) => (
              <option key={copy.id} value={copy.id}>
                {copy.barcode} · {copy.status}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      {issuedCopies.length > 0 ? (
        <p className="m-0 font-mono text-sm text-[color:var(--bookly-muted)]">
          Already out: {issuedCopies.map((copy) => `${copy.barcode} (${copy.status})`).join(' · ')}
        </p>
      ) : null}

      <Field label="Due date" htmlFor="issue-due-date">
        <TextInput
          id="issue-due-date"
          type="date"
          value={dueDate}
          onChange={(event) => onDueDate(event.target.value)}
          disabled={issuePending}
        />
      </Field>

      <Button
        type="button"
        loading={issuePending}
        disabled={availableCopies.length === 0 || rejectPending}
        onClick={onIssue}
      >
        Issue Book
      </Button>
      </div>
    </section>
  );
}

function RejectPanel({
  rejectReason,
  issuePending,
  rejectPending,
  onRejectReason,
  onReject,
}: Readonly<{
  rejectReason: string;
  issuePending: boolean;
  rejectPending: boolean;
  onRejectReason: (value: string) => void;
  onReject: () => void;
}>) {
  return (
    <section className="staff-card p-4">
      <div className="staff-form-stack">
      <h2 className="staff-section-title">Reject request</h2>
      <p className="staff-section-desc">
        Use this if the title can no longer be issued (for example all copies are gone).
      </p>
      <Field label="Reason (optional)" htmlFor="reject-reason">
        <TextInput
          id="reject-reason"
          value={rejectReason}
          onChange={(event) => onRejectReason(event.target.value)}
          disabled={rejectPending}
        />
      </Field>
      <Button
        type="button"
        variant="secondary"
        loading={rejectPending}
        disabled={issuePending}
        onClick={onReject}
      >
        Reject
      </Button>
      </div>
    </section>
  );
}

export default function IssueCheckoutRequestPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <IssueCheckoutRequestContent />
    </RequireRole>
  );
}
