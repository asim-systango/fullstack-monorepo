'use client';

import { DashboardPageHeader, HeaderStatCard } from '@/components/layout/page-header';

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        badge="Procurement & Receiving"
        subtag="Supplier Order Lifecycle"
        title="Purchase Orders Workspace"
        description="Build purchase orders and execute automated stock receptions upon supplier arrival."
      >
        <HeaderStatCard
          label="Pipeline Status"
          value="Ready"
          subtext="for intake"
          tone="primary"
          icon="📋"
        />
      </DashboardPageHeader>
    </div>
  );
}
