import type { BookDetail } from '@shared/types';

export function BookAvailability({ book }: Readonly<{ book: BookDetail }>) {
  return (
    <section className="member-book-section">
      <h2 className="member-book-section-title">Book Information</h2>
      <div className="member-info-grid">
        <div className="member-info-cell">
          <p className="member-info-label">ISBN</p>
          <p className="member-info-value member-info-value-mono">{book.isbn}</p>
        </div>
        <div className="member-info-cell">
          <p className="member-info-label">Published</p>
          <p className="member-info-value">{book.publishedYear ?? '—'}</p>
        </div>
        <div className="member-info-cell">
          <p className="member-info-label">Available</p>
          <p className="member-info-value">
            {book.availableCopies} of {book.totalCopies}
          </p>
        </div>
        <div className="member-info-cell">
          <p className="member-info-label">On loan</p>
          <p className="member-info-value">{book.onLoanCopies}</p>
        </div>
      </div>
    </section>
  );
}
