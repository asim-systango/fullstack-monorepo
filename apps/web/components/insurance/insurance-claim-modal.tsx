'use client';

import React, { useState } from 'react';
import {
  Modal,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Button,
  Field,
  TextInput,
} from '@shared/ui/components';
import { ShieldCheck, IndianRupee, AlertCircle } from 'lucide-react';
import type { Appointment } from '@/features/appointment/types';

interface InsuranceClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSuccess?: () => void;
}

export function InsuranceClaimModal({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: Readonly<InsuranceClaimModalProps>) {
  const [providerName, setProviderName] = useState('Star Health Insurance');
  const [policyNumber, setPolicyNumber] = useState('POL-9842-X7');
  const [claimAmount, setClaimAmount] = useState<number>(
    appointment?.slot?.doctor?.consultationFee || 500,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/insurance-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          providerName,
          policyNumber,
          claimAmount: Number(claimAmount),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit insurance claim');
      }

      setSuccessMsg('Insurance claim submitted successfully! Estimated coverage: 80%.');
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error submitting claim';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          Submit Insurance Claim
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
            <span className="font-semibold text-foreground">Target Consultation:</span>
            <p className="text-muted-foreground">
              {appointment?.slot?.doctor
                ? `Dr. ${appointment.slot.doctor.firstName} ${appointment.slot.doctor.lastName}`
                : 'Medical Consultation'}{' '}
              • Visit Reason: {appointment?.reason || 'General'}
            </p>
          </div>

          <Field label="Insurance Provider Name">
            <TextInput
              type="text"
              required
              value={providerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setProviderName(e.target.value)
              }
              placeholder="e.g. Star Health, HDFC Ergo"
            />
          </Field>

          <Field label="Policy / Member ID Number">
            <TextInput
              type="text"
              required
              value={policyNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPolicyNumber(e.target.value)
              }
              placeholder="e.g. POL-9842-X7"
            />
          </Field>

          <Field label="Claim Amount (₹)">
            <div className="relative">
              <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <TextInput
                type="number"
                required
                min={0}
                value={claimAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setClaimAmount(Number(e.target.value))
                }
                className="pl-8"
              />
            </div>
          </Field>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting || Boolean(successMsg)}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
