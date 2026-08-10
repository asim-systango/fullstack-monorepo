'use client';

import { Card, Select, Button } from '@shared/ui/components';
import { useAppointmentStore, useUiStore } from '@/lib/store';
import { Filter, CalendarPlus, RotateCcw } from 'lucide-react';

export function AppointmentFilterBar() {
  const filterStatus = useAppointmentStore((state) => state.filterStatus);
  const setFilterStatus = useAppointmentStore((state) => state.setFilterStatus);
  const clearFilters = useAppointmentStore((state) => state.clearFilters);
  const setBookingModalOpen = useUiStore((state) => state.setBookingModalOpen);

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
            <Filter className="size-3.5" /> Status Filter:
          </div>

          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-40 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="gap-1.5 text-xs h-9"
          >
            <RotateCcw className="size-3.5" /> Clear
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setBookingModalOpen(true)}
          className="w-full sm:w-auto gap-2 text-xs font-medium"
        >
          <CalendarPlus className="size-4" /> Book New Appointment
        </Button>
      </div>
    </Card>
  );
}
