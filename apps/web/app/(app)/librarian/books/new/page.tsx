'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Field, StatusMessage, TextArea, TextInput } from '@shared/ui/components';
import { RequireRole } from '@/components/dashboard/require-role';
import { StaffPageHeader } from '@/components/staff';
import { toUserMessage } from '@/lib/auth/errors';
import { LIBRARIAN_ROLES } from '@/lib/auth/roles';
import { librarianBookPath } from '@/lib/auth/routes';
import { useCreateBook, useCreateBookCopy } from '@/lib/bookly';

function AddBookContent() {
  const router = useRouter();
  const createBook = useCreateBook();
  const createCopy = useCreateBookCopy();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [createdBookId, setCreatedBookId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onAddBook() {
    setError(null);
    setMessage(null);
    try {
      const book = await createBook.mutateAsync({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        description: description.trim() || undefined,
      });
      setCreatedBookId(book.id);
      setMessage('Book added. Register a physical copy below.');
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  async function onAddCopy() {
    if (!createdBookId) return;
    setError(null);
    setMessage(null);
    try {
      await createCopy.mutateAsync({
        bookId: createdBookId,
        input: { barcode: barcode.trim() },
      });
      setBarcode('');
      setMessage('Copy added.');
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  return (
    <div className="staff-content">
      <StaffPageHeader
        title="Add Book"
        description="Register a title, then add physical copies with barcodes."
      />
      <section className="staff-card staff-card-primary">
        <div className="staff-panel-body staff-form-stack">
          {error ? <Alert tone="danger" title="Could not save">{error}</Alert> : null}
          {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}

          <div className="grid items-start gap-3 sm:grid-cols-3">
            <Field label="Title" htmlFor="add-book-title">
              <TextInput
                id="add-book-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={Boolean(createdBookId)}
              />
            </Field>
            <Field label="Author" htmlFor="add-book-author">
              <TextInput
                id="add-book-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={Boolean(createdBookId)}
              />
            </Field>
            <Field label="ISBN" htmlFor="add-book-isbn">
              <TextInput
                id="add-book-isbn"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={Boolean(createdBookId)}
              />
            </Field>
          </div>
          <Field label="Description (optional)" htmlFor="add-book-description">
            <TextArea
              id="add-book-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={Boolean(createdBookId)}
              maxLength={2000}
              rows={4}
              placeholder="Short summary of the title"
            />
          </Field>

          {!createdBookId ? (
            <Button
              type="button"
              loading={createBook.isPending}
              disabled={!title.trim() || !author.trim() || !isbn.trim() || createBook.isPending}
              onClick={() => void onAddBook()}
            >
              Add book
            </Button>
          ) : (
            <div className="staff-inline-field">
              <Field label="Copy barcode" htmlFor="add-copy-barcode">
                <TextInput
                  id="add-copy-barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Unique barcode"
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  loading={createCopy.isPending}
                  disabled={!barcode.trim() || createCopy.isPending}
                  onClick={() => void onAddCopy()}
                >
                  Add copy
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(librarianBookPath(createdBookId))}
                >
                  View book
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AddBookPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <AddBookContent />
    </RequireRole>
  );
}
