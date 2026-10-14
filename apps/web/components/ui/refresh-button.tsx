'use client';

import { RefreshCw } from 'lucide-react';

type RefreshButtonProps = Readonly<{
  onRefresh: () => void | Promise<unknown>;
  loading?: boolean;
}>;

export function RefreshButton({ onRefresh, loading = false }: RefreshButtonProps) {
  return (
    <button
      type="button"
      className="tg-btn tg-btn-secondary"
      disabled={loading}
      onClick={() => void onRefresh()}
    >
      <RefreshCw size={15} className={loading ? 'tg-icon-spin' : undefined} />
      Refresh
    </button>
  );
}
