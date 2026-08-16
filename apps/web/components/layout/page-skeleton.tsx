'use client';

export type SkeletonHeaderProps = Readonly<{
  statCount?: number;
}>;

function SkeletonHeader({ statCount = 3 }: SkeletonHeaderProps) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-5 w-28 bg-slate-300 dark:bg-slate-800 rounded-md" />
          <div className="h-8 w-64 bg-slate-300 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-96 max-w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
        {statCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            {Array.from({ length: statCount }).map((_, i) => (
              <div
                key={i}
                className="h-20 w-full sm:w-36 bg-slate-200 dark:bg-slate-800 rounded-xl p-3 space-y-2"
              >
                <div className="h-3 w-16 bg-slate-300 dark:bg-slate-700 rounded" />
                <div className="h-6 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export type TableSkeletonProps = Readonly<{
  rows?: number;
}>;

export function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 p-4 space-y-3 animate-pulse">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 h-12 px-4 rounded-xl bg-slate-200/60 dark:bg-slate-800/60"
          >
            <div className="h-4 w-28 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-4 w-36 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-4 w-16 bg-slate-300 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dashboard Page Skeleton (Header + Facility Scope + 3 Charts + Recent Movements Table) */
export function DashboardSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <SkeletonHeader statCount={3} />

      {/* Facility Scope Bar */}
      <div className="h-20 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-slate-300 dark:bg-slate-700 rounded" />
          <div className="h-5 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-9 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* 3 Recharts Pie Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-80 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="h-5 w-40 bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="h-3 w-56 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-40 w-40 mx-auto rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Recent Movements Activity Table */}
      <TableSkeleton rows={4} />
    </div>
  );
}

/** Products Catalog Skeleton (Header + Search & Category Filters + Product Table) */
export function ProductsPageSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <SkeletonHeader statCount={2} />

      {/* Product Toolbar Filter */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 space-y-3">
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Product Table */}
      <TableSkeleton rows={7} />
    </div>
  );
}

/** Stock Movements Skeleton (Header + Action Form + Audit Log Table) */
export function MovementsPageSkeleton() {
  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-pulse">
      <SkeletonHeader statCount={3} />

      {/* Movement Transaction Form Skeleton */}
      <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-10 w-44 bg-slate-300 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* Movements Table */}
      <TableSkeleton rows={6} />
    </div>
  );
}

/** Inter-Warehouse Transfers Skeleton (Header + Transfer Form + Transfer History Table) */
export function TransfersPageSkeleton() {
  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-pulse">
      <SkeletonHeader statCount={3} />

      {/* Transfer Form Skeleton */}
      <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-11 w-52 bg-slate-300 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* Transfers Table */}
      <TableSkeleton rows={5} />
    </div>
  );
}

/** Warehouses Facilities Skeleton (Header + Search Toolbar + 6 Facility Cards Grid) */
export function WarehousesPageSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <SkeletonHeader statCount={3} />

      {/* Search & Action Bar */}
      <div className="flex justify-between items-center gap-4">
        <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-10 w-44 bg-slate-300 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* 6 Warehouse Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-16 bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="h-5 w-20 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="h-6 w-40 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-16 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Warehouse Detail Page Skeleton */
export function WarehouseDetailSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
      <SkeletonHeader statCount={3} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableSkeleton rows={5} />
        </div>
        <div className="h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 p-6" />
      </div>
    </div>
  );
}

// Alias for generic fallback
export const PageSkeleton = DashboardSkeleton;
