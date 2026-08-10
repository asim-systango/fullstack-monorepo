'use client';

import { Card } from '@shared/ui/components';
import { CalendarCheck, Stethoscope, Clock, ShieldAlert } from 'lucide-react';

export function DashboardStats() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="p-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarCheck className="size-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">3</p>
          <p className="text-xs text-muted-foreground font-medium">Active Bookings</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Stethoscope className="size-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">12</p>
          <p className="text-xs text-muted-foreground font-medium">
            Specialists Available
          </p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Clock className="size-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">1</p>
          <p className="text-xs text-muted-foreground font-medium">
            Pending Confirmation
          </p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <ShieldAlert className="size-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">100%</p>
          <p className="text-xs text-muted-foreground font-medium">Slot Guarantee</p>
        </div>
      </Card>
    </div>
  );
}
