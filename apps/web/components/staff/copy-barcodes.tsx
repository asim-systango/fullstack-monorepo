'use client';

import { useBookCopies } from '@/lib/bookly';

export function CopyBarcodes({
  bookId,
}: Readonly<{ bookId: string }>) {
  const copies = useBookCopies(bookId);
  const items = copies.data?.filter((copy) => !copy.deletedAt) ?? [];
  if (copies.isPending || items.length === 0) return null;

  return (
    <p className="m-0 mt-1 font-mono text-xs text-[color:var(--bookly-navy)]">
      {items.map((copy) => copy.barcode).join(' · ')}
    </p>
  );
}
