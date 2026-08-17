import type { BookCopy } from '@shared/types';

export function CopyPicker({
  copies,
  selectedId,
  onSelect,
  loading,
}: Readonly<{
  copies: BookCopy[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}>) {
  const available = copies.filter((copy) => copy.status === 'available' && !copy.deletedAt);
  const other = copies.filter((copy) => copy.status !== 'available' && !copy.deletedAt);

  return (
    <div>
      <p className="mb-2 m-0 text-sm font-medium">Available copies</p>
      {loading ? (
        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">Loading copies…</p>
      ) : null}
      {available.length === 0 && !loading ? (
        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
          No available copies for this title.
        </p>
      ) : (
        <ul className="staff-result-list">
          {available.map((copy) => (
            <li key={copy.id}>
              <button
                type="button"
                className={`staff-pick-row ${selectedId === copy.id ? 'is-selected' : ''}`}
                aria-pressed={selectedId === copy.id}
                onClick={() => onSelect(copy.id)}
              >
                <span className="font-mono text-sm">
                  {copy.barcode} · {copy.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {other.length > 0 ? (
        <ul className="staff-result-list mt-2">
          {other.map((copy) => (
            <li
              key={copy.id}
              className="rounded-md border border-[color:var(--bookly-border)] px-3 py-2 font-mono text-sm text-[color:var(--bookly-muted)]"
            >
              {copy.barcode} · {copy.status}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
