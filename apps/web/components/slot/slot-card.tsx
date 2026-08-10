'use client';

import React from 'react';
import { Card, Badge, Button } from '@shared/ui/components';
import type { Slot } from '@/features/slot/types';
import { Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';

export interface SlotCardProps {
  slot: Slot;
  onBook?: (slot: Slot) => void;
  isBooking?: boolean;
}

export function SlotCard({ slot, onBook, isBooking }: Readonly<SlotCardProps>) {
  const startTime = new Date(slot.startsAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(slot.endsAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusBadge = () => {
    switch (slot.status) {
      case 'AVAILABLE':
        return (
          <Badge tone="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3" /> Available
          </Badge>
        );
      case 'BOOKED':
        return (
          <Badge tone="warning" className="gap-1">
            <XCircle className="w-3 h-3" /> Booked
          </Badge>
        );
      case 'BLOCKED':
        return (
          <Badge tone="danger" className="gap-1">
            <Ban className="w-3 h-3" /> Unavailable
          </Badge>
        );
    }
  };

  return (
    <Card
      className={`p-4 transition-all duration-200 ${slot.status === 'AVAILABLE' ? 'hover:border-primary/50 shadow-sm hover:shadow' : 'opacity-75'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">
              {startTime} – {endTime}
            </div>
            <div className="mt-1">{getStatusBadge()}</div>
          </div>
        </div>

        {slot.status === 'AVAILABLE' && onBook && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onBook(slot)}
            loading={isBooking}
            className="text-xs px-3 py-1 h-8"
          >
            Book Slot
          </Button>
        )}
      </div>
    </Card>
  );
}
