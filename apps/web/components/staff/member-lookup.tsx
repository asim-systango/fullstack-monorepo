'use client';

import { useEffect, useState } from 'react';
import { Alert, Field, TextInput } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import { useMember, useMemberLoanSummary, useMemberSearch } from '@/lib/bookly';
import { formatMoneyInr } from '@/lib/member/format';
import { useLibraryStore } from '@/lib/store';

export function MemberLookup() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const selectedMemberId = useLibraryStore((s) => s.selectedMemberId);
  const setSelectedMemberId = useLibraryStore((s) => s.setSelectedMemberId);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const search = useMemberSearch(debounced);
  const detail = useMember(selectedMemberId ?? undefined);
  const summary = useMemberLoanSummary(selectedMemberId ?? undefined);

  return (
    <section id="member-lookup" className="staff-card staff-card-primary scroll-mt-24">
      <div className="p-4 pb-2">
        <h2 className="staff-section-title">Find a member</h2>
        <p className="staff-section-desc">Search by name, email, or member ID.</p>
      </div>
      <div className="staff-panel-body staff-form-stack">
        <Field label="Search" htmlFor="member-lookup-q">
          <TextInput
            id="member-lookup-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name / email / member ID…"
            autoComplete="off"
          />
        </Field>

        {search.isError ? (
          <Alert tone="danger" title="Search failed">
            {toUserMessage(search.error)}
          </Alert>
        ) : null}

        {search.data && search.data.length === 0 && debounced ? (
          <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
            No members matched.
          </p>
        ) : null}

        {search.data && search.data.length > 0 ? (
          <ul className="staff-result-list">
            {search.data.map((hit) => (
              <li key={hit.userId}>
                <button
                  type="button"
                  className={`staff-member-row w-full border-0 bg-transparent text-left ${
                    selectedMemberId === hit.userId
                      ? 'rounded-md bg-[color-mix(in_srgb,var(--bookly-teal-muted,#00a88e)_10%,#fff)]'
                      : ''
                  }`}
                  onClick={() => setSelectedMemberId(hit.userId)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-medium">{hit.fullName}</p>
                    <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                      {hit.email} · {hit.activeLoanCount} active loan(s)
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {detail.isError ? (
          <Alert tone="danger" title="Could not load member">
            {toUserMessage(detail.error)}
          </Alert>
        ) : null}

        {detail.data ? (
          <div className="rounded-md border border-[color:var(--bookly-border)] p-3 text-sm">
            <p className="m-0 font-medium">{detail.data.fullName}</p>
            <p className="m-0 mt-1 text-[color:var(--bookly-muted)]">
              {detail.data.email}
            </p>
            <p className="m-0 mt-2 text-[color:var(--bookly-muted)]">
              Status: {detail.data.status}
              {' · '}Active loans: {detail.data.activeLoanCount}
              {summary.data
                ? ` / ${summary.data.maxActiveLoans} (remaining ${summary.data.remaining})`
                : ''}
            </p>
            <p className="m-0 mt-1 text-[color:var(--bookly-muted)]">
              Outstanding balance: {formatMoneyInr(detail.data.outstandingBalanceCents)}
            </p>
            {detail.data.loans.length > 0 ? (
              <ul className="mt-3 m-0 list-none space-y-2 p-0">
                {detail.data.loans.slice(0, 5).map((loan) => (
                  <li
                    key={loan.id}
                    className="border-t border-[color:var(--bookly-border)] pt-2"
                  >
                    <p className="m-0 font-medium">{loan.book.title}</p>
                    <p className="m-0 text-xs text-[color:var(--bookly-muted)]">
                      Due {loan.dueDate.slice(0, 10)} · {loan.bookCopy.barcode}
                      {loan.returnedAt ? ' · Returned' : ' · Active'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 mt-2 text-xs text-[color:var(--bookly-muted)]">
                No loan history loaded.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
