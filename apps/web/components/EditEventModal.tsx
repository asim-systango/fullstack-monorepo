'use client';

import { Rocket } from 'lucide-react';
import {
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTitle,
  useToast,
} from '@shared/ui/components';
import { EventForm } from '@/components/EventForm';
import { useUpdateEvent, type EventItem } from '@/hooks/useEvents';

interface EditEventModalProps {
  event: EventItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultStatus?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
}

export function EditEventModal({
  event,
  open,
  onClose,
  onSuccess,
  defaultStatus,
}: EditEventModalProps) {
  const updateMutation = useUpdateEvent();
  const toast = useToast();

  if (!event) return null;

  const targetStatus = defaultStatus || event.status;
  const isPublishing = targetStatus === 'PUBLISHED' && event.status === 'DRAFT';

  const handleSubmit = (values: any) => {
    updateMutation.mutate(
      { id: event.id, input: values },
      {
        onSuccess: () => {
          toast.success(
            isPublishing ? `Event "${values.title || event.title}" published successfully!` : `Event updated successfully!`,
            isPublishing ? 'Event Published' : 'Event Saved',
          );
          onClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || err?.message || 'Failed to save event details.',
            'Save Error',
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()} className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold flex items-center gap-2">
          {isPublishing ? (
            <>
              <Rocket className="h-5 w-5 text-primary" />
              <span>Complete Details & Publish Event</span>
            </>
          ) : (
            <span>Edit Event Details</span>
          )}
        </DialogTitle>
      </DialogHeader>
      <DialogBody className="pt-2">
        <EventForm
          initialValues={{
            title: event.title,
            description: event.description || '',
            location: event.location || '',
            capacity: event.capacity,
            category: event.category,
            status: targetStatus,
            startDate: event.startDate || '',
            endDate: event.endDate || '',
          }}
          onSubmit={handleSubmit}
          pending={updateMutation.isPending}
          disableStatus={isPublishing}
          submitText={isPublishing ? 'Save & Publish Event' : 'Save & Update Event'}
        />
      </DialogBody>
    </Dialog>
  );
}
