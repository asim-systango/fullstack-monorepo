'use client';

import { Page, Badge } from '@shared/ui/components';
import { MovementForm } from '@/components/movements/movement-form';
import { MovementTable } from '@/components/movements/movement-table';
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
      <div className="w-full border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge tone="accent" className="font-bold text-xs px-2.5 py-0.5">
              Live Inventory Stream
            </Badge>
            <span className="text-xs text-muted-foreground font-semibold">
              Auto-synced with Warehouse Database
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Stock Movements & Order Fulfillment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deduct customer order shipments, record inbound goods, and review full
            facility movement audit history.
          </p>
        </div>

        {/* Quick KPI Stat Counter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg bg-muted/40 border border-border/60 px-3.5 py-2 text-left">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Logged
            </div>
            <div className="text-xl font-black text-foreground">
              {totalMovements}{' '}
              <span className="text-xs font-medium text-muted-foreground">records</span>
            </div>
          </div>

          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-2 text-left">
            <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Outbound Shipped
            </div>
            <div className="text-xl font-black text-red-600">
              {totalItemsShipped}{' '}
              <span className="text-xs font-medium text-red-600/70">
                pcs ({outboundFulfillments.length} orders)
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-left">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Inbound Receipts
            </div>
            <div className="text-xl font-black text-emerald-600">
              {inboundReceipts.length}{' '}
              <span className="text-xs font-medium text-emerald-600/70">shipments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Form Section */}
      <MovementForm />

      {/* Full-width Audit Trail Table Section */}
      <div className="w-full space-y-4 pt-2">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <span>📜</span>
          <span>Stock Movement Audit Log</span>
        </h2>
        <MovementTable />
      </div>
    </Page>
  );
}
