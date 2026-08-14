'use client';

import { useState, type CSSProperties } from 'react';
import type { ListLoansParams } from '@shared/types';
import { Button } from '@shared/ui/components';
import {
  LoanCard,
  MemberEmpty,
  MemberError,
  MemberLoadingGrid,
  RequireMember,
} from '@/components/member';
import { ROUTES } from '@/lib/auth/routes';
import { useMyLoans } from '@/lib/bookly';

type LoanFilter = NonNullable<ListLoansParams['status']> | 'all';

function MyLoansContent() {
  const [status, setStatus] = useState<LoanFilter>('active');
  const loans = useMyLoans({
    limit: 50,
    status: status === 'all' ? undefined : status,
  });

  const filters: { id: LoanFilter; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'returned', label: 'Returned' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="member-enter">
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-[color:var(--bookly-navy)]">
          My Loans
        </h1>
        <p className="mt-2 mb-0 text-[color:var(--bookly-muted)]">
          Track due dates and overdue titles. Returns happen at the desk.
        </p>
      </header>

      <div
        className="member-enter flex flex-wrap gap-2"
        style={{ '--member-stagger': 1 } as CSSProperties}
      >
        {filters.map((filter) => (
          <Button
            key={filter.id}
            type="button"
            size="sm"
            variant={status === filter.id ? 'primary' : 'secondary'}
            onClick={() => setStatus(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {loans.isPending ? <MemberLoadingGrid count={3} /> : null}
      {loans.isError ? (
        <MemberError title="Could not load loans" error={loans.error} />
      ) : null}

      {!loans.isPending && !loans.isError && (loans.data?.items.length ?? 0) === 0 ? (
        <MemberEmpty
          title="No loans in this view"
          description="When you borrow a book, it will appear here."
          href={ROUTES.books}
          actionLabel="Browse Books"
        />
      ) : null}

      {loans.data && loans.data.items.length > 0 ? (
        <div className="grid gap-3">
          {loans.data.items.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function MyLoansPage() {
  return (
    <RequireMember>
      <MyLoansContent />
    </RequireMember>
  );
}
