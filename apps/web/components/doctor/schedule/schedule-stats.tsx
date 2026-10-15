'use client';

import React from 'react';
import { Card } from '@shared/ui/components';
import { Calendar, Clock, CheckCircle2, Ban } from 'lucide-react';
import type { Slot } from '@/features/slot/types';

interface ScheduleStatsProps {
  slots: Slot[];
  todayAppointmentsCount: number;
}

export function ScheduleStats({
  slots,
  todayAppointmentsCount,
}: Readonly<ScheduleStatsProps>) {
  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE').length;
  const bookedSlots = slots.filter((s) => s.status === 'BOOKED').length;
  const blockedSlots = slots.filter((s) => s.status === 'BLOCKED').length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4 bg-card/60 backdrop-blur border-border/60 hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Today&apos;s Appointments
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {todayAppointmentsCount}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 backdrop-blur border-border/60 hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Available Slots
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-500">{availableSlots}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 backdrop-blur border-border/60 hover:border-amber-500/40 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Booked Slots
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-500">{bookedSlots}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 backdrop-blur border-border/60 hover:border-rose-500/40 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Blocked Slots
            </p>
            <p className="mt-1 text-2xl font-bold text-rose-500">{blockedSlots}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </Card>
    </div>
  );
}
