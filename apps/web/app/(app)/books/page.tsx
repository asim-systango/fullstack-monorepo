'use client';

import { useState, type CSSProperties, type SyntheticEvent } from 'react';
import { Button, Checkbox, Field, TextInput } from '@shared/ui/components';
import {
  BookCard,
  MemberEmpty,
  MemberError,
  MemberLoadingGrid,
  RequireMember,
} from '@/components/member';
import { useBooks } from '@/lib/bookly';

const PAGE_SIZE = 12;

function BrowseBooksContent() {
  const [titleQ, setTitleQ] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState({
    q: '',
    author: '',
    isbn: '',
    availableOnly: false,
    page: 1,
  });

  const books = useBooks({
    page: applied.page,
    limit: PAGE_SIZE,
    q: applied.q || undefined,
    author: applied.author || undefined,
    isbn: applied.isbn || undefined,
    availableOnly: applied.availableOnly || undefined,
    sort: 'title',
  });

  const total = books.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function applyFilters(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setApplied({
      q: titleQ.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      availableOnly,
      page: 1,
    });
  }

  function clearFilters() {
    setTitleQ('');
    setAuthor('');
    setIsbn('');
    setAvailableOnly(false);
    setPage(1);
    setApplied({ q: '', author: '', isbn: '', availableOnly: false, page: 1 });
  }

  function goToPage(next: number) {
    setPage(next);
    setApplied((prev) => ({ ...prev, page: next }));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="member-enter">
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-[color:var(--bookly-navy)]">
          Browse Books
        </h1>
        <p className="mt-2 mb-0 text-[color:var(--bookly-muted)]">
          Search the catalog by title, author, or ISBN. Reserve unavailable titles from
          the detail page.
        </p>
      </header>

      <form
        onSubmit={applyFilters}
        className="member-card member-enter grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4"
        style={{ '--member-stagger': 1 } as CSSProperties}
      >
        <Field label="Title" htmlFor="book-q">
          <TextInput
            id="book-q"
            value={titleQ}
            onChange={(e) => setTitleQ(e.target.value)}
            placeholder="Search title"
          />
        </Field>
        <Field label="Author" htmlFor="book-author">
          <TextInput
            id="book-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
          />
        </Field>
        <Field label="ISBN" htmlFor="book-isbn">
          <TextInput
            id="book-isbn"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="ISBN"
          />
        </Field>
        <div className="flex flex-col justify-end gap-3">
          <Checkbox
            id="available-only"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            label="Available only"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm">
              Search
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </form>

      {books.isPending ? <MemberLoadingGrid count={8} /> : null}
      {books.isError ? (
        <MemberError title="Could not load catalog" error={books.error} />
      ) : null}

      {!books.isPending && !books.isError && (books.data?.items.length ?? 0) === 0 ? (
        <MemberEmpty
          title="No books matched"
          description="Try a different title, author, or clear your filters."
        />
      ) : null}

      {!books.isPending && books.data && books.data.items.length > 0 ? (
        <>
          <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
            Showing {books.data.items.length} of {total} title{total === 1 ? '' : 's'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {books.data.items.map((book, index) => (
              <div
                key={book.id}
                className="member-enter"
                style={{ '--member-stagger': Math.min(index, 8) } as CSSProperties}
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Previous
              </Button>
              <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                Page {page} of {totalPages}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default function BrowseBooksPage() {
  return (
    <RequireMember>
      <BrowseBooksContent />
    </RequireMember>
  );
}
