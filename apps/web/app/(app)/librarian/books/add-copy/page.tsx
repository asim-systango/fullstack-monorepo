'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Book, BookCopy } from '@shared/types';
import {
  Alert,
  Button,
  Field,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { AdminPageHeader } from '@/components/admin';
import { useAuth } from '@/components/auth';
import { RequireRole } from '@/components/dashboard/require-role';
import { StaffListStatus, StaffPageHeader } from '@/components/staff';
import { toUserMessage } from '@/lib/auth/errors';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { ROUTES, librarianBookPath } from '@/lib/auth/routes';
import { useBookCopies, useBooks, useCreateBookCopy } from '@/lib/bookly';
import { useDebouncedValue } from '@/lib/staff';

function CatalogPicker({
  query,
  onQuery,
  books,
  selectedId,
  onSelect,
  hasFilters,
}: Readonly<{
  query: string;
  onQuery: (value: string) => void;
  books: ReturnType<typeof useBooks>;
  selectedId: string | null;
  onSelect: (book: Book) => void;
  hasFilters: boolean;
}>) {
  return (
    <>
      <div className="mb-4 max-w-xl">
        <Field label="Search catalog" htmlFor="add-copy-book">
          <TextInput
            id="add-copy-book"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Title, author, or ISBN…"
            autoComplete="off"
          />
        </Field>
      </div>

      <StaffListStatus
        isPending={books.isPending}
        isError={books.isError}
        error={books.error}
        isEmpty={!books.data || books.data.items.length === 0}
        hasFilters={hasFilters}
        emptyTitle="No titles"
        emptyDescription="Add a book first, then register physical copies here."
        onRetry={() => void books.refetch()}
        onClearFilters={hasFilters ? () => onQuery('') : undefined}
      >
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Copies</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {books.data?.items.map((book) => {
                const isSelected = selectedId === book.id;
                return (
                  <tr key={book.id}>
                    <td>
                      <Link href={librarianBookPath(book.id)}>{book.title}</Link>
                    </td>
                    <td>{book.author}</td>
                    <td className="font-mono text-sm">{book.isbn}</td>
                    <td>
                      {book.availableCopies ?? 0} / {book.totalCopies ?? 0}
                    </td>
                    <td>
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? 'primary' : 'secondary'}
                        onClick={() => onSelect(book)}
                      >
                        {isSelected ? 'Selected' : 'Add copy'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </StaffListStatus>
    </>
  );
}

function SelectedCopyForm({
  book,
  barcode,
  onBarcode,
  onAdd,
  onClear,
  saving,
  error,
  message,
  copies,
  copiesPending,
  copiesError,
}: Readonly<{
  book: Book;
  barcode: string;
  onBarcode: (value: string) => void;
  onAdd: () => void;
  onClear: () => void;
  saving: boolean;
  error: string | null;
  message: string | null;
  copies: BookCopy[];
  copiesPending: boolean;
  copiesError: unknown;
}>) {
  return (
    <div className="staff-form-stack">
      {error ? (
        <Alert tone="danger" title="Could not save">
          {error}
        </Alert>
      ) : null}
      {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}

      <div className="staff-inline-field">
        <Field label="Copy barcode" htmlFor="add-copy-barcode">
          <TextInput
            id="add-copy-barcode"
            value={barcode}
            onChange={(e) => onBarcode(e.target.value)}
            placeholder="Unique barcode"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            loading={saving}
            disabled={!barcode.trim() || saving}
            onClick={onAdd}
          >
            Add copy
          </Button>
          <Link
            href={librarianBookPath(book.id)}
            className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
          >
            View book
          </Link>
          <Button type="button" size="sm" variant="secondary" onClick={onClear}>
            Change title
          </Button>
        </div>
      </div>

      {copiesPending ? (
        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">Loading copies…</p>
      ) : null}
      {copiesError ? (
        <Alert tone="danger" title="Could not load copies">
          {toUserMessage(copiesError)}
        </Alert>
      ) : null}
      {!copiesPending && copies.length === 0 ? (
        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
          This title has no physical copies yet.
        </p>
      ) : null}
      {copies.length > 0 ? (
        <ul className="staff-result-list">
          {copies.map((copy) => (
            <li
              key={copy.id}
              className="rounded-md border border-[color:var(--bookly-border)] px-3 py-2 font-mono text-sm"
            >
              {copy.barcode} · {copy.status}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AddCopyContent() {
  const { user } = useAuth();
  const isAdmin = hasRole(user, [ROLES.admin]);
  const createCopy = useCreateBookCopy();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Book | null>(null);
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const committed = useDebouncedValue(query.trim(), 250);

  const books = useBooks({ q: committed || undefined, limit: 20 });
  const copies = useBookCopies(selected?.id);
  const activeCopies = copies.data?.filter((copy) => !copy.deletedAt) ?? [];

  async function onAddCopy() {
    if (!selected) return;
    setError(null);
    setMessage(null);
    try {
      await createCopy.mutateAsync({
        bookId: selected.id,
        input: { barcode: barcode.trim() },
      });
      setBarcode('');
      setMessage(`Copy added to ${selected.title}.`);
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  function selectBook(book: Book) {
    setSelected(book);
    setBarcode('');
    setError(null);
    setMessage(null);
  }

  function clearSelection() {
    setSelected(null);
    setBarcode('');
    setMessage(null);
    setError(null);
  }

  const shellClass = isAdmin ? 'admin-content' : 'staff-content';
  const cardClass = isAdmin ? 'admin-card' : 'staff-card staff-card-primary';
  const titleClass = isAdmin ? 'admin-section-title' : 'staff-section-title';
  const descClass = isAdmin ? 'admin-section-desc' : 'staff-section-desc';
  const headingClass = isAdmin ? 'px-4 pt-4 pb-2 sm:px-5' : 'p-4 pb-2';
  const bodyClass = isAdmin ? 'admin-panel-body' : 'staff-panel-body';

  return (
    <div className={shellClass}>
      {isAdmin ? (
        <AdminPageHeader
          title="Add Copies"
          description="Choose a title from the catalog, then register a physical copy barcode."
        />
      ) : (
        <StaffPageHeader
          title="Add Copies"
          description="Choose a title from the catalog, then register a physical copy barcode."
        />
      )}

      <section className={`${cardClass} mb-4`}>
        <div className={headingClass}>
          <h2 className={titleClass}>Catalog</h2>
          <p className={descClass}>Select the title that needs another physical copy.</p>
        </div>
        <div className={bodyClass}>
          <CatalogPicker
            query={query}
            onQuery={setQuery}
            books={books}
            selectedId={selected?.id ?? null}
            onSelect={selectBook}
            hasFilters={Boolean(committed)}
          />
        </div>
      </section>

      {selected ? (
        <section className={cardClass}>
          <div className={headingClass}>
            <h2 className={titleClass}>{selected.title}</h2>
            <p className={descClass}>
              {selected.author} · {selected.isbn}
            </p>
          </div>
          <div className={bodyClass}>
            <SelectedCopyForm
              book={selected}
              barcode={barcode}
              onBarcode={setBarcode}
              onAdd={() => void onAddCopy()}
              onClear={clearSelection}
              saving={createCopy.isPending}
              error={error}
              message={message}
              copies={activeCopies}
              copiesPending={copies.isPending}
              copiesError={copies.isError ? copies.error : null}
            />
          </div>
        </section>
      ) : (
        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
          No title selected.{' '}
          <Link href={ROUTES.librarianBooksNew} className="font-medium">
            Add a book
          </Link>{' '}
          if it is not in the catalog yet.
        </p>
      )}
    </div>
  );
}

export default function AddCopyPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <AddCopyContent />
    </RequireRole>
  );
}
