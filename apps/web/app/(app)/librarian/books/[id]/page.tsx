'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Alert, Button, Field, Skeleton, StatusMessage, TextInput } from '@shared/ui/components';
import { RequireRole } from '@/components/dashboard/require-role';
import { StaffEmptyState, StaffPageHeader } from '@/components/staff';
import { toUserMessage } from '@/lib/auth/errors';
import { LIBRARIAN_ROLES } from '@/lib/auth/roles';
import { ROUTES } from '@/lib/auth/routes';
import {
  useBook,
  useBookCopies,
  useCreateBookCopy,
  useDeleteBook,
  useDeleteBookCopy,
} from '@/lib/bookly';

function BookDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const book = useBook(id);
  const copies = useBookCopies(id);
  const createCopy = useCreateBookCopy();
  const deleteCopy = useDeleteBookCopy();
  const deleteBook = useDeleteBook();
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const activeCopies = copies.data?.filter((copy) => !copy.deletedAt) ?? [];

  async function onAddCopy() {
    setError(null);
    setMessage(null);
    try {
      await createCopy.mutateAsync({ bookId: id, input: { barcode: barcode.trim() } });
      setBarcode('');
      setMessage('Copy added.');
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  async function onDeleteBook() {
    setError(null);
    try {
      await deleteBook.mutateAsync(id);
      router.push(ROUTES.librarianBooks);
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  if (book.isPending) {
    return (
      <div className="staff-content">
        <StaffPageHeader title="Book details" />
        <Skeleton size="lg" />
      </div>
    );
  }

  if (book.isError || !book.data) {
    return (
      <div className="staff-content">
        <StaffPageHeader title="Book details" />
        <Alert tone="danger" title="Could not load book">
          {toUserMessage(book.error)}
        </Alert>
      </div>
    );
  }

  return (
    <div className="staff-content">
      <StaffPageHeader
        title={book.data.title}
        description={`${book.data.author} · ${book.data.isbn}`}
        actions={
          <Button
            type="button"
            size="sm"
            variant="danger"
            loading={deleteBook.isPending}
            onClick={() => void onDeleteBook()}
          >
            Delete title
          </Button>
        }
      />

      <section className="staff-card mb-4">
        <div className="p-4">
          <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
            Available {book.data.availableCopies} · On loan {book.data.onLoanCopies} · Total{' '}
            {book.data.totalCopies}
          </p>
          {book.data.description ? (
            <p className="mt-3 mb-0 text-sm">{book.data.description}</p>
          ) : null}
        </div>
      </section>

      <section className="staff-card staff-card-operational">
        <div className="p-4 pb-2">
          <h2 className="staff-section-title">Physical copies</h2>
          <p className="staff-section-desc">Register barcodes and remove copies that are not on loan.</p>
        </div>
        <div className="staff-panel-body staff-form-stack">
          {error ? <Alert tone="danger" title="Update failed">{error}</Alert> : null}
          {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}

          <div className="staff-inline-field">
            <Field label="New barcode" htmlFor="detail-copy-barcode">
              <TextInput
                id="detail-copy-barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Unique barcode"
              />
            </Field>
            <Button
              type="button"
              loading={createCopy.isPending}
              disabled={!barcode.trim() || createCopy.isPending}
              onClick={() => void onAddCopy()}
            >
              Add copy
            </Button>
          </div>

          {copies.isPending ? <Skeleton size="lg" /> : null}
          {copies.isError ? (
            <Alert tone="danger" title="Could not load copies">
              {toUserMessage(copies.error)}
            </Alert>
          ) : null}
          {copies.data && activeCopies.length === 0 ? (
            <StaffEmptyState
              title="No copies"
              description="Add a physical copy barcode for this title."
            />
          ) : null}
          {activeCopies.length > 0 ? (
            <ul className="staff-result-list">
              {activeCopies.map((copy) => (
                <li
                  key={copy.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--bookly-border)] py-2"
                >
                  <p className="m-0 text-sm">
                    <span className="font-mono font-medium">{copy.barcode}</span>
                    {' · '}
                    {copy.status}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    loading={deleteCopy.isPending}
                    onClick={() => {
                      setError(null);
                      void deleteCopy
                        .mutateAsync({ id: copy.id, bookId: copy.bookId })
                        .then(() => setMessage('Copy removed.'))
                        .catch((err) => setError(toUserMessage(err)));
                    }}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default function LibrarianBookDetailPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <BookDetailContent />
    </RequireRole>
  );
}
