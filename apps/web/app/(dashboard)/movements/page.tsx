'use client';

import { Page } from '@shared/ui/components';
import { MovementForm } from '@/components/movements/movement-form';
import { MovementTable } from '@/components/movements/movement-table';
import { DashboardPageHeader, HeaderStatCard } from '@/components/layout/page-header';
import { useMovements } from '@/lib/hooks/use-movements';

export default function MovementsPage() {
  const { data: movements = [] } = useMovements();

  // Summary Metrics
  const totalMovements = movements.length;
  const outboundFulfillments = movements.filter((m) => m.type === 'outbound');
  const inboundReceipts = movements.filter((m) => m.type === 'inbound');

  const totalItemsShipped = outboundFulfillments.reduce((acc, m) => acc + m.quantity, 0);

  return (
    <Page className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Page Header Banner */}
      <DashboardPageHeader
        badge="Live Inventory Stream"
        subtag="Auto-synced with Warehouse Database"
        title="Stock Movements & Order Fulfillment"
        description="Deduct customer order shipments, record inbound goods, and review full facility movement audit history."
      >
        <HeaderStatCard
          label="Total Logged"
          value={totalMovements}
          subtext="records"
          tone="primary"
          icon="📊"
        />
        <HeaderStatCard
          label="Outbound Shipped"
          value={totalItemsShipped}
          subtext={`pcs (${outboundFulfillments.length} orders)`}
          tone="danger"
          icon="📤"
        />
        <HeaderStatCard
          label="Inbound Receipts"
          value={inboundReceipts.length}
          subtext="shipments"
          tone="success"
          icon="📥"
        />
      </DashboardPageHeader>

      {/* Full-width Form Section */}
      <MovementForm />

      {/* Full-width Audit Trail Table Section */}
      <div className="w-full space-y-4 pt-2">
        <h2 className="text-xl font-extrabold tracking-tight text-[#4747A1] dark:text-white flex items-center gap-2">
          <span>📜</span>
          <span>Stock Movement Audit Log</span>
        </h2>
        <MovementTable />
      </div>
    </Page>
  );
}
