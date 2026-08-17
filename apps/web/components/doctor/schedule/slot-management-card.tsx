'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Badge,
  Button,
  EmptyState,
  Pagination,
} from '@shared/ui/components';
import type { Slot, SlotStatus } from '@/features/slot/types';
import { useUpdateSlotStatus, useDeleteSlot } from '@/features/slot/hooks';
import { Clock, Plus, Ban, CheckCircle2, Trash2, Calendar, Filter } from 'lucide-react';

interface SlotManagementCardProps {
  slots: Slot[];
  isLoading?: boolean;
  onOpenCreateModal: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

function getSlotCardStyle(status: SlotStatus): string {
  if (status === 'AVAILABLE') {
    return 'bg-card border-border hover:border-emerald-500/50 shadow-xs';
  }
  if (status === 'BOOKED') {
    return 'bg-amber-500/5 border-amber-500/30';
  }
  return 'bg-rose-500/5 border-rose-500/30 opacity-80';
}

function getSlotIconStyle(status: SlotStatus): string {
  if (status === 'AVAILABLE') {
    return 'bg-emerald-500/10 text-emerald-500';
  }
  if (status === 'BOOKED') {
    return 'bg-amber-500/10 text-amber-500';
  }
  return 'bg-rose-500/10 text-rose-500';
}

function getSlotBadgeTone(status: SlotStatus): 'success' | 'warning' | 'danger' {
  if (status === 'AVAILABLE') return 'success';
  if (status === 'BOOKED') return 'warning';
  return 'danger';
}

function getEmptyStateDescription(statusFilter: string): string {
  if (statusFilter === 'ALL') {
    return 'No consultation slots configured for this date. Click "Add / Generate Slots" to set up your schedule.';
  }
  return `No slots with status "${statusFilter}" found for this date.`;
}

function formatLocalDate(dateInput: Date | string | number): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function SlotManagementCard({
  slots,
  isLoading,
  onOpenCreateModal,
  selectedDate,
  onDateChange,
}: Readonly<SlotManagementCardProps>) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | SlotStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const updateStatus = useUpdateSlotStatus();
  const deleteSlot = useDeleteSlot();

  const todayStr = formatLocalDate(new Date());
  const tomorrowStr = formatLocalDate(new Date(Date.now() + 86400000));

  const isSelectedDateToday = selectedDate === todayStr;

  const filteredSlots = slots.filter((slot) => {
    // 1. Date Filter
    if (slot.startsAt) {
      const slotDateStr = formatLocalDate(slot.startsAt);
      if (slotDateStr !== selectedDate) {
        return false;
      }
    }

    // 2. Hide past slots for today
    if (isSelectedDateToday && new Date(slot.endsAt).getTime() <= Date.now()) {
      return false;
    }

    // 3. Status Filter
    return statusFilter === 'ALL' || slot.status === statusFilter;
  });

  const handleToggleBlock = async (slot: Slot) => {
    const newStatus: SlotStatus = slot.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';
    try {
      await updateStatus.mutateAsync({ id: slot.id, status: newStatus });
    } catch {
      // Handled by react query
    }
  };

  const handleDelete = async (slotId: string) => {
    try {
      await deleteSlot.mutateAsync(slotId);
    } catch {
      // Handled by react query
    }
  };

  const handleDateSelect = (date: string) => {
    onDateChange(date);
    setCurrentPage(1);
  };

  const handleStatusSelect = (st: 'ALL' | SlotStatus) => {
    setStatusFilter(st);
    setCurrentPage(1);
  };

  const renderSlotContent = () => {
    if (isLoading) {
      return (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (filteredSlots.length === 0) {
      return (
        <EmptyState
          title="No slots found"
          description={getEmptyStateDescription(statusFilter)}
        />
      );
    }

    const pageSize = 9;
    const totalPages = Math.max(1, Math.ceil(filteredSlots.length / pageSize));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedSlots = filteredSlots.slice(
      (safePage - 1) * pageSize,
      safePage * pageSize,
    );

    return (
      <div className="space-y-4">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {paginatedSlots.map((slot) => {
            const startTime = new Date(slot.startsAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const endTime = new Date(slot.endsAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={slot.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${getSlotCardStyle(slot.status)}`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${getSlotIconStyle(slot.status)}`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">
                        {startTime} – {endTime}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        30 mins duration
                      </div>
                    </div>
                  </div>

                  <Badge
                    tone={getSlotBadgeTone(slot.status)}
                    className="text-[10px] px-1.5 py-0.5 shrink-0"
                  >
                    {slot.status}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/40">
                  {slot.status !== 'BOOKED' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleBlock(slot)}
                        loading={
                          updateStatus.isPending && updateStatus.variables?.id === slot.id
                        }
                        className="h-6 text-[11px] px-1.5 text-muted-foreground hover:text-foreground"
                        title={
                          slot.status === 'AVAILABLE' ? 'Block Slot' : 'Unblock Slot'
                        }
                      >
                        {slot.status === 'AVAILABLE' ? (
                          <>
                            <Ban className="w-3 h-3 mr-1 text-rose-500" /> Block
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />{' '}
                            Unblock
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(slot.id)}
                        loading={deleteSlot.isPending && deleteSlot.variables === slot.id}
                        className="h-6 text-[11px] px-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        title="Delete Slot"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}

                  {slot.status === 'BOOKED' && (
                    <span className="text-[10px] italic text-amber-600 font-medium">
                      Patient Scheduled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Pagination
          currentPage={safePage}
          totalItems={filteredSlots.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  return (
    <Card className="shadow-sm border-border bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Upcoming Consultation Slots
          </CardTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage slot availability, block/unblock time, or delete unused slots
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={onOpenCreateModal}
          className="gap-1 text-xs h-8 shadow-sm hover:shadow shrink-0 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" /> Add / Generate Slots
        </Button>
      </CardHeader>

      <CardBody className="pt-3 space-y-3">
        {/* Date Selector & Filters */}
        <div className="flex flex-col gap-2.5 bg-muted/30 p-2.5 rounded-xl border border-border/50">
          {/* Quick Date Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleDateSelect(todayStr)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDate === todayStr
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-background border border-border/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleDateSelect(tomorrowStr)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDate === tomorrowStr
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-background border border-border/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              Tomorrow
            </button>

            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                className="pl-7 pr-2 py-1 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Calendar className="w-3.5 h-3.5 absolute left-2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="flex items-center text-[11px] font-semibold text-muted-foreground mr-1">
              <Filter className="w-3 h-3 mr-1" /> Filter:
            </span>
            {(['ALL', 'AVAILABLE', 'BOOKED', 'BLOCKED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusSelect(st)}
                className={`px-2 py-0.5 rounded-md text-[11px] capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-primary/15 text-primary font-bold border border-primary/30'
                    : 'bg-background text-muted-foreground hover:text-foreground border border-border/40'
                }`}
              >
                {st.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {renderSlotContent()}
      </CardBody>
    </Card>
  );
}
