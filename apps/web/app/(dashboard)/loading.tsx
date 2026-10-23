import { TableSkeleton } from '@/components/layout/page-skeleton';

export default function Loading() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <TableSkeleton rows={6} />
    </div>
  );
}
