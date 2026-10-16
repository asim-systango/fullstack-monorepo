'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  TextInput,
  useToast,
} from '@shared/ui/components';
import { useCheckInTicket } from '@/hooks/useTickets';
import { CameraQrScanner } from './CameraQrScanner';

export function ScannerWidget() {
  const [payloadInput, setPayloadInput] = useState('');
  const checkInMutation = useCheckInTicket();
  const toast = useToast();

  const handleProcessCheckIn = (payload: string) => {
    const cleanPayload = payload.trim();
    if (!cleanPayload) return;

    checkInMutation.mutate(cleanPayload, {
      onSuccess: (data) => {
        setPayloadInput('');
        toast.success(
          `Ticket verified for event "${data.event?.title || 'Event'}". Admission confirmed!`,
          'Check-In Successful',
        );
      },
      onError: (err: {
        response?: { data?: { message?: string } };
        message?: string;
      }) => {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          'Ticket is invalid or has already been used.';
        toast.error(errorMsg, 'Check-In Failed');
      },
    });
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    handleProcessCheckIn(payloadInput);
  };

  return (
    <Card className="border border-border/80 bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Staff QR Ticket Scanner</CardTitle>
          <Badge tone="accent" className="text-xs">
            Staff / Admin Tool
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="space-y-5">
        <p className="text-xs text-muted-foreground">
          Scan an attendee's QR code pass directly using your phone's live camera, or
          enter the payload manually below.
        </p>

        {/* Live Smartphone Camera QR Scanner */}
        <CameraQrScanner onScanSuccess={handleProcessCheckIn} />

        <div className="relative flex items-center justify-center border-t border-border/60 pt-2">
          <span className="bg-card px-2 text-[11px] font-semibold text-muted-foreground uppercase">
            Or Manual Code Check-In
          </span>
        </div>

        {/* Manual Payload Entry Form */}
        <Form
          onSubmit={handleSubmit}
          pending={checkInMutation.isPending}
          className="space-y-3"
        >
          <div className="flex gap-2">
            <TextInput
              placeholder="e.g. TKT-ad833bfa-21a544e6-1001"
              value={payloadInput}
              onChange={(e) => setPayloadInput(e.target.value)}
              className="flex-1 font-mono text-xs"
            />
            <Button
              type="submit"
              variant="primary"
              loading={checkInMutation.isPending}
              loadingText="Verifying..."
            >
              Check In
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}
