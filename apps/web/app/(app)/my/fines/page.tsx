'use client';

import type { CSSProperties } from 'react';
import {
  FineRow,
  MemberEmpty,
  MemberError,
  MemberLoadingGrid,
  RequireMember,
} from '@/components/member';
import { useMyFines } from '@/lib/bookly';
import { formatMoneyInr } from '@/lib/member';

function MyFinesContent() {
  const fines = useMyFines({ limit: 50 });
  const unpaid = fines.data?.items.filter((fine) => fine.status === 'unpaid') ?? [];
  const outstanding = unpaid.reduce((sum, fine) => sum + fine.amountCents, 0);
  let unpaidSummary = "You're all clear";
  if (unpaid.length === 1) unpaidSummary = '1 unpaid fine';
  else if (unpaid.length > 1) unpaidSummary = `${unpaid.length} unpaid fines`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="member-enter">
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-[color:var(--bookly-navy)]">
          My Fines
        </h1>
        <p className="mt-2 mb-0 text-[color:var(--bookly-muted)]">
          Review outstanding balances and history. Payment is handled at the library desk.
        </p>
      </header>

      {fines.isPending ? <MemberLoadingGrid count={3} /> : null}
      {fines.isError ? (
        <MemberError title="Could not load fines" error={fines.error} />
      ) : null}

      {!fines.isPending && !fines.isError ? (
        <div
          className="member-card member-enter flex flex-wrap items-center justify-between gap-3 p-4"
          style={{ '--member-stagger': 1 } as CSSProperties}
        >
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--bookly-muted)]">
              Outstanding total
            </p>
            <p className="mt-1 mb-0 text-2xl font-semibold text-[color:var(--bookly-navy)]">
              {formatMoneyInr(outstanding)}
            </p>
          </div>
          <p className="m-0 text-sm text-[color:var(--bookly-muted)]">{unpaidSummary}</p>
        </div>
      ) : null}

      {!fines.isPending && !fines.isError && (fines.data?.items.length ?? 0) === 0 ? (
        <MemberEmpty title="You're all clear." description="No fines on your account." />
      ) : null}

      {fines.data && fines.data.items.length > 0 ? (
        <section className="space-y-3">
          <h2 className="m-0 text-lg font-semibold text-[color:var(--bookly-navy)]">
            Fine history
          </h2>
          {fines.data.items.map((fine) => (
            <FineRow key={fine.id} fine={fine} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default function MyFinesPage() {
  return (
    <RequireMember>
      <MyFinesContent />
    </RequireMember>
  );
}
