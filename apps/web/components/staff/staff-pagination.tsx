import { Button } from '@shared/ui/components';

export function StaffPagination({
  page,
  total,
  limit,
  onPage,
}: Readonly<{
  page: number;
  total: number;
  limit: number;
  onPage: (page: number) => void;
}>) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  return (
    <div className="staff-pagination">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </Button>
      <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
        Page {page} of {totalPages}
      </p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
