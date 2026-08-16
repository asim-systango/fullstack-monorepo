'use client';

import { useState, type CSSProperties, type SyntheticEvent } from 'react';
import { Button, Checkbox, Field, TextInput } from '@shared/ui/components';
import {
  BookCard,
  MemberContent,
  MemberEmpty,
  MemberError,
  MemberLoadingGrid,
  MemberPageHeader,
  RequireMember,
} from '@/components/member';
import { useBooks } from '@/lib/bookly';

const PAGE_SIZE = 12;

function normalizeIsbn(value: string): string {
  return value.trim().replace(/[-\s]/g, '');
}

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
  const searching = Boolean(applied.q || applied.author || applied.isbn || applied.availableOnly);

  function applyFilters(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setApplied({
      q: titleQ.trim(),
      author: author.trim(),
      isbn: normalizeIsbn(isbn),
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

  function onAvailableOnlyChange(checked: boolean) {
    setAvailableOnly(checked);
    setPage(1);
    setApplied({
      q: titleQ.trim(),
      author: author.trim(),
      isbn: normalizeIsbn(isbn),
      availableOnly: checked,
      page: 1,
    });
  }

  function goToPage(next: number) {
    setPage(next);
    setApplied((prev) => ({ ...prev, page: next }));
  }

  return (
    <MemberContent className="flex flex-col gap-8">
      <MemberPageHeader
        title="Browse Books"
        description="Search the catalog by title, author, or ISBN. Reserve unavailable titles from the detail page."
      />

      <form
        onSubmit={applyFilters}
        className="member-card member-search-card member-enter"
        style={{ '--member-stagger': 1 } as CSSProperties}
      >
        <div className="member-search-fields">
          <Field label="Title" htmlFor="book-q" className="mb-0">
            <TextInput
              id="book-q"
              value={titleQ}
              onChange={(e) => setTitleQ(e.target.value)}
              placeholder="Search title"
            />
          </Field>
          <Field label="Author" htmlFor="book-author" className="mb-0">
            <TextInput
              id="book-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
            />
          </Field>
          <Field label="ISBN" htmlFor="book-isbn" className="mb-0">
            <TextInput
              id="book-isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="ISBN"
            />
          </Field>
        </div>
        <div className="member-search-actions">
          <Checkbox
            id="available-only"
            className="mb-0"
            checked={availableOnly}
            onChange={(e) => onAvailableOnlyChange(e.target.checked)}
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
          title="No books found"
          description={
            searching
              ? 'Try adjusting your title, author, ISBN, or availability filter.'
              : 'The catalog is empty right now. Check back soon.'
          }
        />
      ) : null}

      {!books.isPending && books.data && books.data.items.length > 0 ? (
        <section className="member-catalog-results">
          <p className="member-catalog-count">
            Showing {books.data.items.length} of {total} title{total === 1 ? '' : 's'}
          </p>
          <div className="member-book-grid">
            {books.data.items.map((book, index) => (
              <div
                key={book.id}
                className="member-enter h-full"
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
        </section>
      ) : null}
    </MemberContent>
  );
}

export default function BrowseBooksPage() {
  return (
    <RequireMember>
      <BrowseBooksContent />
    </RequireMember>
  );
}
