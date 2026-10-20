'use client';

import { Card } from '@shared/ui/components';
import { useTickets } from '@/lib/hooks/use-tickets';
import { isSlaBreached } from './sla-breach-badge';

export function AgentDashboardStats() {
  const { data: allTickets } = useTickets({ limit: 100 });

  const items = allTickets?.items ?? [];
  const totalCount = allTickets?.total ?? items.length;
  const openCount = items.filter((t) => t.status === 'open').length;
  const pendingCount = items.filter((t) => t.status === 'pending').length;
  const breachCount = items.filter(isSlaBreached).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 border-l-4 border-l-primary bg-card/70">
        <p className="text-xs text-muted-foreground uppercase font-semibold">
          Total Queue
        </p>
        <p className="text-2xl font-extrabold text-foreground mt-1">{totalCount}</p>
      </Card>

      <Card className="p-4 border-l-4 border-l-blue-500 bg-card/70">
        <p className="text-xs text-muted-foreground uppercase font-semibold">
          Open Tickets
        </p>
        <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
          {openCount}
        </p>
      </Card>

      <Card className="p-4 border-l-4 border-l-amber-500 bg-card/70">
        <p className="text-xs text-muted-foreground uppercase font-semibold">
          Pending Response
        </p>
        <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
          {pendingCount}
        </p>
      </Card>

      <Card className="p-4 border-l-4 border-l-red-500 bg-card/70">
        <p className="text-xs text-muted-foreground uppercase font-semibold">
          SLA Breached
        </p>
        <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">
          {breachCount}
        </p>
      </Card>
    </div>
  );
}
