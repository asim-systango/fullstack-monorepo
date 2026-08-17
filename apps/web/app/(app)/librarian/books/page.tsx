'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Checkbox,
  Field,
  Select,
  TextInput,
} from '@shared/ui/components';
import { RequireRole } from '@/components/dashboard/require-role';
import {
  StaffListStatus,
  StaffPageHeader,
  StaffPagination,
} from '@/components/staff';
import { LIBRARIAN_ROLES } from '@/lib/auth/roles';
import { ROUTES, librarianBookPath } from '@/lib/auth/routes';
import { useBooks, useDeletedBooks, useRestoreBook } from '@/lib/bookly';
import { toUserMessage } from '@/lib/auth/errors';
import { useDebouncedValue, useStaffListParams } from '@/lib/staff';
import type { BookSort } from '@shared/types';

const PAGE_SIZE = 20;

function BooksBrowseContent() {
  const { get, page, replace, setPage, clear, hasFilters } = useStaffListParams();
  const view = get('view');
  const q = get('q');
  const author = get('author');
  const isbn = get('isbn');
  const availableOnly = get('availableOnly') === 'true';
  const sort = (get('sort') || 'title') as BookSort;

  const [draftQ, setDraftQ] = useState(q);
  const [draftAuthor, setDraftAuthor] = useState(author);
  const [draftIsbn, setDraftIsbn] = useState(isbn);
  const debouncedQ = useDebouncedValue(draftQ.trim(), 250);
  const debouncedAuthor = useDebouncedValue(draftAuthor.trim(), 250);
  const debouncedIsbn = useDebouncedValue(draftIsbn.trim(), 250);

  useEffect(() => {
    setDraftQ(q);
  }, [q]);
  useEffect(() => {
    setDraftAuthor(author);
  }, [author]);
  useEffect(() => {
    setDraftIsbn(isbn);
  }, [isbn]);

  useEffect(() => {
    if (debouncedQ === q && debouncedAuthor === author && debouncedIsbn === isbn) return;
    replace({
      q: debouncedQ || undefined,
      author: debouncedAuthor || undefined,
      isbn: debouncedIsbn || undefined,
    });
  }, [author, debouncedAuthor, debouncedIsbn, debouncedQ, isbn, q, replace]);

  const catalogFiltersActive = Boolean(q || author || isbn || availableOnly);
  const showingDeleted = view === 'deleted';
  const books = useBooks(
    {
      page,
      limit: PAGE_SIZE,
      q: q || undefined,
      author: author || undefined,
      isbn: isbn || undefined,
      availableOnly: availableOnly || undefined,
      sort,
    },
    { enabled: view !== 'deleted' },
  );
  const deleted = useDeletedBooks(
    { page, limit: PAGE_SIZE, q: q || undefined },
    { enabled: showingDeleted },
  );
  const restoreBook = useRestoreBook();
  const list = showingDeleted ? deleted : books;

  return (
    <div className="staff-content">
      <StaffPageHeader
        title="Books"
        description="Search the catalog, check availability, and manage physical copies."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={ROUTES.librarianBooksAddCopy}
              className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
            >
              Add Copies
            </Link>
            <Link
              href={ROUTES.librarianBooksNew}
              className="ui-button ui-button-sm ui-button-primary no-underline hover:no-underline"
            >
              Add Book
            </Link>
          </div>
        }
      />

      <section className="staff-card staff-card-primary">
        <div className="staff-panel-body">
          <div className="staff-segment" role="tablist" aria-label="Catalog view">
            <button
              type="button"
              role="tab"
              className={`staff-segment-btn ${!showingDeleted ? 'is-selected' : ''}`}
              aria-selected={!showingDeleted}
              onClick={() => replace({ view: undefined })}
            >
              Catalog
            </button>
            <button
              type="button"
              role="tab"
              className={`staff-segment-btn ${showingDeleted ? 'is-selected' : ''}`}
              aria-selected={showingDeleted}
              onClick={() => replace({ view: 'deleted' })}
            >
              Deleted titles
            </button>
          </div>

          <div className="staff-filter-row staff-filter-row-4">
            <Field label="Title" htmlFor="books-q">
              <TextInput
                id="books-q"
                value={draftQ}
                onChange={(e) => setDraftQ(e.target.value)}
                placeholder="Search title…"
                autoComplete="off"
              />
            </Field>
            <Field label="Author" htmlFor="books-author">
              <TextInput
                id="books-author"
                value={draftAuthor}
                onChange={(e) => setDraftAuthor(e.target.value)}
                placeholder="Search author…"
                autoComplete="off"
              />
            </Field>
            <Field label="ISBN" htmlFor="books-isbn">
              <TextInput
                id="books-isbn"
                value={draftIsbn}
                onChange={(e) => setDraftIsbn(e.target.value)}
                placeholder="Search ISBN…"
                autoComplete="off"
              />
            </Field>
            <Field label="Sort" htmlFor="books-sort">
              <Select
                id="books-sort"
                value={sort}
                onChange={(e) => replace({ sort: e.target.value === 'title' ? undefined : e.target.value })}
              >
                <option value="title">Title A–Z</option>
                <option value="-title">Title Z–A</option>
                <option value="author">Author A–Z</option>
                <option value="-createdAt">Newest</option>
              </Select>
            </Field>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {!showingDeleted ? (
              <Checkbox
                label="Available copies only"
                checked={availableOnly}
                onChange={(e) =>
                  replace({ availableOnly: e.target.checked || undefined })
                }
              />
            ) : (
              <span />
            )}
            {hasFilters ? (
              <Button type="button" size="sm" variant="secondary" onClick={clear}>
                Clear filters
              </Button>
            ) : null}
          </div>

          <StaffListStatus
            isPending={list.isPending}
            isError={list.isError}
            error={list.error}
            isEmpty={!list.data || list.data.items.length === 0}
            hasFilters={showingDeleted ? Boolean(q) : catalogFiltersActive}
            emptyTitle={showingDeleted ? 'No deleted books' : 'No catalog items'}
            emptyDescription={
              showingDeleted
                ? 'Soft-deleted titles will appear here for restore.'
                : 'Add a title to begin building the collection.'
            }
            onRetry={() => void list.refetch()}
            onClearFilters={clear}
          >
            <div className="staff-table-wrap">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    {!showingDeleted ? <th>Availability</th> : null}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {list.data?.items.map((book) => (
                    <tr key={book.id}>
                      <td>
                        {showingDeleted ? (
                          book.title
                        ) : (
                          <Link href={librarianBookPath(book.id)}>{book.title}</Link>
                        )}
                      </td>
                      <td>{book.author}</td>
                      <td className="font-mono text-sm">{book.isbn}</td>
                      {!showingDeleted ? (
                        <td>
                          {book.availableCopies ?? 0} / {book.totalCopies ?? 0}
                        </td>
                      ) : null}
                      <td>
                        {showingDeleted ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            loading={restoreBook.isPending}
                            onClick={() => void restoreBook.mutateAsync(book.id)}
                          >
                            Restore
                          </Button>
                        ) : (
                          <Link
                            href={librarianBookPath(book.id)}
                            className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
                          >
                            Manage
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <StaffPagination
              page={page}
              total={list.data?.total ?? 0}
              limit={PAGE_SIZE}
              onPage={setPage}
            />
          </StaffListStatus>
          {restoreBook.isError ? (
            <p className="mt-3 mb-0 text-sm text-[color:var(--staff-warn)]">
              {toUserMessage(restoreBook.error)}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default function LibrarianBooksPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <Suspense
        fallback={
          <div className="staff-content">
            <StaffPageHeader title="Books" />
          </div>
        }
      >
        <BooksBrowseContent />
      </Suspense>
    </RequireRole>
  );
}
