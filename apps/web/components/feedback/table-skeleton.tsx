import { Skeleton } from '@shared/ui/components';

const ROW_KEYS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'];

export function TableSkeleton({ rows = 5 }: Readonly<{ rows?: number }>) {
  return (
    <output className="block space-y-2" aria-label="Loading">
      {ROW_KEYS.slice(0, rows).map((key) => (
        <Skeleton key={key} size="md" />
      ))}
    </output>
  );
}
