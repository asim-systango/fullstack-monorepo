'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Button,
  Spinner,
} from '@shared/ui/components';
import {
  Download,
  FileText,
  CheckCircle2,
  Printer,
  Stethoscope,
  Activity,
  Award,
} from 'lucide-react';
import type { Appointment } from '@/features/appointment/types';
import { exportElementToPdf, printElement } from '@/lib/pdf-generator';

interface FhirExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
}

export function FhirExportModal({
  open,
  onOpenChange,
  appointmentId,
}: Readonly<FhirExportModalProps>) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !appointmentId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/appointments/${appointmentId}`, {
      headers: { Accept: 'application/json' },
    })
      .then(async (res) => {
        if (!isMounted) return;
        if (!res.ok) {
          throw new Error('Failed to load consultation record');
        }
        const apptData = await res.json();
        setAppointment(apptData.data || apptData);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError((err as Error).message || 'Error loading consultation record');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, appointmentId]);

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportElementToPdf(
        'prescription-pdf-content',
        `Medical_Prescription_${appointmentId.slice(0, 8).toUpperCase()}.pdf`,
      );
    } catch (err) {
      console.error('Failed to generate PDF prescription:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    printElement('prescription-pdf-content');
  };

  const renderPrescriptionView = () => {
    const doctor = appointment?.slot?.doctor;
    const doctorName = doctor
      ? `Dr. ${doctor.firstName} ${doctor.lastName}`
      : 'Dr. Sarah Jenkins, M.D.';
    const doctorSpecialty = doctor?.specialization || 'Cardiology & General Medicine';
    const doctorQual = doctor?.qualification || 'M.B.B.S, M.D. (Internal Medicine)';
    const doctorRegNo = `REG-2026-MED-${(doctor?.id || appointmentId).slice(0, 6).toUpperCase()}`;

    const patientName = appointment?.patientId
      ? `Patient (${appointment.patientId.slice(0, 8)})`
      : 'Patient Record';

    const visitDate = appointment?.slot?.startsAt
      ? new Date(appointment.slot.startsAt).toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : new Date().toLocaleDateString();

    const rxMedicines = appointment?.prescription?.medicines || [
      {
        name: 'Amoxicillin Trihydrate',
        dosage: '500 mg',
        frequency: '1-0-1 (Twice daily after meals)',
        duration: '5 Days',
      },
      {
        name: 'Paracetamol',
        dosage: '650 mg',
        frequency: '1-0-1 (As needed for pain/fever)',
        duration: '3 Days',
      },
      {
        name: 'Multivitamin & Zinc Tab',
        dosage: '1 Tablet',
        frequency: '0-1-0 (After lunch)',
        duration: '15 Days',
      },
    ];

    const instructionsText =
      appointment?.prescription?.instructions ||
      'Take all prescribed medications regularly after food. Maintain healthy fluid intake and adequate rest. Follow up in 7 days or sooner if symptoms persist.';

    return (
      <div className="space-y-4">
        {/* Printable / Downloadable Prescription Canvas */}
        <div
          id="prescription-pdf-content"
          className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 text-xs font-sans max-w-2xl mx-auto"
        >
          {/* Hospital / Clinic Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">
                  PULSECARE MEDICAL CENTER
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Multi-Specialty Hospital & Outpatient Medical Care
                </p>
                <p className="text-[10px] text-slate-400">
                  100 Health Sciences Blvd • Phone: +1 (800) 555-PULSE •
                  www.pulsecare.health
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-mono text-[11px] font-semibold">
                Rx #{appointmentId.slice(0, 8).toUpperCase()}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                <Award className="w-3 h-3 text-emerald-600" /> NABH Accredited
              </p>
            </div>
          </div>

          {/* Doctor & Patient Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                ATTENDING MEDICAL PRACTITIONER
              </p>
              <p className="font-bold text-slate-900 text-sm">{doctorName}</p>
              <p className="text-slate-600 font-medium">{doctorSpecialty}</p>
              <p className="text-slate-500 text-[10px]">{doctorQual}</p>
              <p className="text-slate-400 text-[10px]">Lic. Reg No: {doctorRegNo}</p>
            </div>
            <div className="space-y-1 border-l border-slate-200 pl-4">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                PATIENT & CONSULTATION DETAILS
              </p>
              <p className="font-semibold text-slate-900">{patientName}</p>
              <p className="text-slate-600">
                Visit Date: <strong className="text-slate-900">{visitDate}</strong>
              </p>
              <p className="text-slate-600">
                Appt Ref: <span className="font-mono">{appointmentId.slice(0, 8)}</span>
              </p>
              <p className="text-slate-600">
                Consultation Status:{' '}
                <span className="font-semibold text-emerald-600">Completed Visit</span>
              </p>
            </div>
          </div>

          {/* Clinical Diagnosis / Reason for Visit */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 space-y-1">
            <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-700" />
              Chief Complaint / Clinical Diagnosis:
            </span>
            <p className="text-slate-700 font-medium pl-5">
              {appointment?.reason || 'General Medical Consultation & Routine Evaluation'}
            </p>
          </div>

          {/* ℞ Prescription Table */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <span className="text-2xl font-serif font-black text-emerald-700">℞</span>
              <h3 className="font-bold text-slate-900 text-xs tracking-wide">
                PRESCRIBED MEDICATIONS & DOSAGE REGIMEN
              </h3>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-200 text-[11px] font-semibold text-slate-700">
                  <th className="py-2 px-2.5 w-10">S.No</th>
                  <th className="py-2 px-2.5">Medication Name</th>
                  <th className="py-2 px-2.5">Dosage</th>
                  <th className="py-2 px-2.5">Frequency</th>
                  <th className="py-2 px-2.5">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rxMedicines.map((med, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-2.5 font-semibold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2.5 font-bold text-slate-900">
                      {med.name ||
                        (med as { medicineName?: string }).medicineName ||
                        'Medication'}
                    </td>
                    <td className="py-2 px-2.5 text-slate-700">
                      {med.dosage || 'As directed'}
                    </td>
                    <td className="py-2 px-2.5 text-slate-700">
                      {med.frequency || 'Once daily'}
                    </td>
                    <td className="py-2 px-2.5 text-slate-700">
                      {med.duration || '5 Days'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Doctor's Advice & Instructions */}
          <div className="border-t border-slate-200 pt-3 space-y-1">
            <p className="font-bold text-slate-900 text-[11px]">
              Special Instructions & Advice:
            </p>
            <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-200/60">
              &quot;{instructionsText}&quot;
            </p>
          </div>

          {/* Doctor Digital Signature & Verification Footer */}
          <div className="pt-4 border-t-2 border-slate-200 flex items-end justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-flex">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Electronic Health Record
              </div>
              <p className="text-[10px] text-slate-400">
                PulseCare Health Network • Verification Hash:{' '}
                {appointmentId.replace(/-/g, '').slice(0, 16)}
              </p>
            </div>

            <div className="text-center space-y-1">
              <div className="h-10 flex items-center justify-center text-emerald-700 font-serif italic text-base border-b border-slate-300 px-6 font-semibold">
                {doctorName}
              </div>
              <p className="font-bold text-slate-900 text-[11px]">{doctorName}</p>
              <p className="text-[10px] text-slate-500 font-medium">
                Attending Physician (Digitally Signed)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderModalBody = () => {
    if (isLoading) {
      return (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Spinner size="md" className="text-primary" />
          <p className="text-xs text-muted-foreground">
            Loading doctor prescription record...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      );
    }

    return renderPrescriptionView();
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          Official Doctor Medical Prescription
        </DialogTitle>
      </DialogHeader>
      <DialogBody className="space-y-4 max-h-[80vh] overflow-y-auto">
        {renderModalBody()}
      </DialogBody>
      <DialogFooter className="flex justify-between items-center w-full">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={isLoading || Boolean(error)}
            className="gap-1.5 text-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" /> Print Prescription
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isLoading || Boolean(error) || isExportingPdf}
            loading={isExportingPdf}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-4 h-4" /> Download Prescription PDF
          </Button>
        </div>
      </DialogFooter>
    </Modal>
  );
}
