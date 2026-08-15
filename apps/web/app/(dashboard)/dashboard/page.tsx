'use client';

import { DashboardPageHeader, HeaderStatCard } from '@/components/layout/page-header';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        badge="Enterprise Overview"
        subtag="Real-time Metrics"
        title="Executive Dashboard"
        description="Overview of warehouse logistics, total SKUs in stock, and critical replenishment alerts."
      >
        <HeaderStatCard
          label="System Status"
          value="Online"
          subtext="sync active"
          tone="primary"
          icon="⚡"
        />
      </DashboardPageHeader>
    </div>
  );
}
