'use client';

import { Badge } from '@shared/ui/components';
import { Stethoscope, ChevronRight } from 'lucide-react';
import type { DoctorInfo } from '../../doctors';

type StepDoctorSelectProps = {
  doctors: DoctorInfo[];
  selectedDoctorId: string | null;
  onSelect: (doctor: DoctorInfo) => void;
};

export function StepDoctorSelect({
  doctors,
  selectedDoctorId,
  onSelect,
}: Readonly<StepDoctorSelectProps>) {
  return (
    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Step 1: Choose a Medical Specialist
      </p>
      {doctors.map((doc) => {
        const isSelected = doc.id === selectedDoctorId;
        return (
          <button
            key={doc.id}
            type="button"
            onClick={() => onSelect(doc)}
            className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
              isSelected
                ? 'border-primary bg-primary/5 shadow-xs'
                : 'border-border hover:border-primary/40 bg-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Stethoscope className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge tone="outline" className="text-[10px]">
                    {doc.specialty}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ${doc.consultationFee}
                  </span>
                </div>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-transparent text-foreground hover:bg-muted'
              }`}
            >
              Select <ChevronRight className="size-3.5" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
