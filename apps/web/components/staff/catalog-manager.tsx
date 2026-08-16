'use client';

import { useState } from 'react';
import { Alert, Button, Field, StatusMessage, TextInput } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import {
  useBookCopies,
  useBooks,
  useCreateBook,
  useCreateBookCopy,
  useDeleteBook,
  useDeleteBookCopy,
  useDeletedBooks,
  useRestoreBook,
} from '@/lib/bookly';
import { StaffEmptyState } from './staff-empty-state';
import { CopyBarcodes } from './copy-barcodes';

type CatalogTab = 'books' | 'copies' | 'deleted';

export function CatalogManager() {
  const [tab, setTab] = useState<CatalogTab>('books');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [barcode, setBarcode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const books = useBooks({ limit: 20, sort: 'title' });
  const deleted = useDeletedBooks({ limit: 20 });
  const copies = useBookCopies(selectedBookId ?? undefined);
  const createBook = useCreateBook();
  const deleteBook = useDeleteBook();
  const restoreBook = useRestoreBook();
  const createCopy = useCreateBookCopy();
  const deleteCopy = useDeleteBookCopy();

  async function onAddBook() {
    setError(null);
    setMessage(null);
    try {
      await createBook.mutateAsync({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
      });
      setTitle('');
      setAuthor('');
      setIsbn('');
      setMessage('Book added to the catalog.');
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  async function onAddCopy() {
    if (!selectedBookId) return;
    setError(null);
    setMessage(null);
    try {
      await createCopy.mutateAsync({
        bookId: selectedBookId,
        input: { barcode: barcode.trim() },
      });
      setBarcode('');
      setMessage('Copy added.');
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  return (
    <section id="catalog" className="staff-card staff-card-primary scroll-mt-24">
      <div className="p-4 pb-2">
        <h2 className="staff-section-title">Catalog management</h2>
        <p className="staff-section-desc">
          Add, remove, and restore titles and physical copies.
        </p>
      </div>
      <div className="staff-panel-body">
        <div className="staff-tabs" role="tablist" aria-label="Catalog sections">
          {(
            [
              ['books', 'Books'],
              ['copies', 'Book copies'],
              ['deleted', 'Deleted books'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              className={`staff-tab ${tab === id ? 'is-selected' : ''}`}
              aria-selected={tab === id}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}

        {tab === 'books' ? (
          <div className="staff-form-stack">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Title" htmlFor="new-book-title">
                <TextInput
                  id="new-book-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>
              <Field label="Author" htmlFor="new-book-author">
                <TextInput
                  id="new-book-author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </Field>
              <Field label="ISBN" htmlFor="new-book-isbn">
                <TextInput
                  id="new-book-isbn"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                />
              </Field>
            </div>
            <Button
              type="button"
              loading={createBook.isPending}
              disabled={
                !title.trim() || !author.trim() || !isbn.trim() || createBook.isPending
              }
              onClick={() => void onAddBook()}
            >
              Add book
            </Button>

            {books.isError ? (
              <Alert tone="danger" title="Could not load books">
                {toUserMessage(books.error)}
              </Alert>
            ) : null}
            {books.data && books.data.items.length === 0 ? (
              <StaffEmptyState
                title="No catalog items"
                description="Add your first book to begin building the collection."
              />
            ) : null}
            {books.data && books.data.items.length > 0 ? (
              <ul className="staff-result-list">
                {books.data.items.map((book) => (
                  <li
                    key={book.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--bookly-border)] py-2"
                  >
                    <div className="min-w-0">
                      <p className="m-0 font-medium">{book.title}</p>
                      <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                        {book.author}
                      </p>
                      <CopyBarcodes bookId={book.id} />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedBookId(book.id);
                          setTab('copies');
                        }}
                      >
                        Copies
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        loading={deleteBook.isPending}
                        onClick={() => {
                          setError(null);
                          void deleteBook
                            .mutateAsync(book.id)
                            .then(() => setMessage('Book deleted.'))
                            .catch((err) => setError(toUserMessage(err)));
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {tab === 'copies' ? (
          <div className="staff-form-stack">
            {!selectedBookId ? (
              <StaffEmptyState
                title="Select a book"
                description="Open Copies from a title in the Books tab."
              />
            ) : (
              <>
                <Field label="New barcode" htmlFor="new-copy-barcode">
                  <TextInput
                    id="new-copy-barcode"
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
                {copies.isError ? (
                  <Alert tone="danger" title="Could not load copies">
                    {toUserMessage(copies.error)}
                  </Alert>
                ) : null}
                {copies.data && copies.data.length === 0 ? (
                  <StaffEmptyState
                    title="No copies"
                    description="Add a physical copy barcode for this title."
                  />
                ) : null}
                {copies.data && copies.data.length > 0 ? (
                  <ul className="staff-result-list">
                    {copies.data.map((copy) => (
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
              </>
            )}
          </div>
        ) : null}

        {tab === 'deleted' ? (
          <div className="staff-form-stack">
            {deleted.isError ? (
              <Alert tone="danger" title="Could not load deleted books">
                {toUserMessage(deleted.error)}
              </Alert>
            ) : null}
            {deleted.data && deleted.data.items.length === 0 ? (
              <StaffEmptyState
                title="No deleted books"
                description="Soft-deleted titles will appear here for restore."
              />
            ) : null}
            {deleted.data && deleted.data.items.length > 0 ? (
              <ul className="staff-result-list">
                {deleted.data.items.map((book) => (
                  <li
                    key={book.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--bookly-border)] py-2"
                  >
                    <div>
                      <p className="m-0 font-medium">{book.title}</p>
                      <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                        {book.author}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      loading={restoreBook.isPending}
                      onClick={() => {
                        setError(null);
                        void restoreBook
                          .mutateAsync(book.id)
                          .then(() => setMessage('Book restored.'))
                          .catch((err) => setError(toUserMessage(err)));
                      }}
                    >
                      Restore
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
