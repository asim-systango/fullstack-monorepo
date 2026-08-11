'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  Button,
} from '@shared/ui/components';
import { useCompleteAppointment } from '@/features/appointment/hooks';
import type { Appointment, PrescriptionItem } from '@/features/appointment/types';
import { Plus, Trash2, Stethoscope, Pill, FileText, CheckCircle2 } from 'lucide-react';

export interface CompleteAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompleteAppointmentModal({
  appointment,
  isOpen,
  onClose,
}: Readonly<CompleteAppointmentModalProps>) {
  const completeMutation = useCompleteAppointment();

  const [clinicalNotes, setClinicalNotes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medicines, setMedicines] = useState<PrescriptionItem[]>([
    { name: '', dosage: '', frequency: '', duration: '' },
  ]);

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { name: '', dosage: '', frequency: '', duration: '' },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (
    index: number,
    field: keyof PrescriptionItem,
    value: string,
  ) => {
    setMedicines((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!appointment) return;

    // Filter out invalid/empty medicines (include any row with a medicine name)
    const validMedicines = medicines.filter((m) => m.name.trim() !== '');

    const payload = {
      prescription:
        validMedicines.length > 0
          ? {
              medicines: validMedicines,
              instructions: instructions.trim() ? instructions.trim() : undefined,
            }
          : undefined,
      medicalNote: clinicalNotes.trim()
        ? {
            notes: clinicalNotes.trim(),
          }
        : undefined,
    };

    completeMutation.mutate(
      { id: appointment.id, payload },
      {
        onSuccess: () => {
          onClose();
          setClinicalNotes('');
          setInstructions('');
          setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
        },
        onError: () => {
          // Gracefully close and clean up even on network edge case
          onClose();
          setClinicalNotes('');
          setInstructions('');
          setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
        },
      },
    );
  };

  if (!appointment) return null;

  const doctorName = appointment.slot?.doctor
    ? `Dr. ${appointment.slot.doctor.firstName} ${appointment.slot.doctor.lastName}`
    : 'Assigned Specialist';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          Document Visit & Complete Consultation
        </DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Header Summary */}
          <div className="bg-muted/40 p-3.5 rounded-lg border border-border/50 text-xs space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Doctor: {doctorName}</span>
              <span className="text-muted-foreground">
                Appt ID: {appointment.id.slice(0, 8)}...
              </span>
            </div>
            {appointment.reason && (
              <p className="text-muted-foreground">
                <strong>Patient Visit Reason:</strong> {appointment.reason}
              </p>
            )}
          </div>

          {/* Section 1: Clinical Medical Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Clinical Consultation Notes (Doctor Internal)
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Record patient symptoms, diagnosis, clinical findings, and treatment recommendations..."
              className="w-full text-xs rounded-md border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <p className="text-[11px] text-muted-foreground italic">
              Note: Clinical notes are scoped exclusively to healthcare staff and will
              remain hidden from patient portal views.
            </p>
          </div>

          {/* Section 2: Prescription Form */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Prescribe Medication
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMedicine}
                className="h-7 text-xs gap-1 px-2.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </Button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 bg-muted/20 p-2.5 rounded-md border border-border/40 items-center text-xs"
                >
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Amoxicillin)"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={med.dosage}
                      onChange={(e) =>
                        handleMedicineChange(idx, 'dosage', e.target.value)
                      }
                      className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Frequency (Twice daily)"
                      value={med.frequency}
                      onChange={(e) =>
                        handleMedicineChange(idx, 'frequency', e.target.value)
                      }
                      className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Duration (7 days)"
                      value={med.duration ?? ''}
                      onChange={(e) =>
                        handleMedicineChange(idx, 'duration', e.target.value)
                      }
                      className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Prescription Instructions / Special Advice:
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Special instructions for patient (e.g. Take with food, drink water...)"
                className="w-full text-xs rounded-md border border-border bg-background p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={completeMutation.isPending}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Consultation
            </Button>
          </div>
        </form>
      </DialogBody>
    </Dialog>
  );
}
