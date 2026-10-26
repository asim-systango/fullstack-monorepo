import { Button } from '@shared/ui/components';

type PaginationProps = Readonly<{
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}>;

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>{`Showing ${first}–${last} of ${total}`}</span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span>{`Page ${page} of ${pages}`}</span>
        <Button
          size="sm"
          variant="secondary"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
