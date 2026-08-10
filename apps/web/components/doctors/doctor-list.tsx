'use client';

import { EmptyState } from '@shared/ui/components';
import { DoctorCard, type DoctorInfo } from './doctor-card';

type DoctorListProps = {
  doctors: DoctorInfo[];
  onBookDoctor: (doctor: DoctorInfo) => void;
};

export function DoctorList({ doctors, onBookDoctor }: Readonly<DoctorListProps>) {
  if (doctors.length === 0) {
    return (
      <EmptyState
        title="No Specialists Found"
        description="Try adjusting your search filter or select another medical specialization."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {doctors.map((doc) => (
        <DoctorCard key={doc.id} doctor={doc} onBookClick={onBookDoctor} />
      ))}
    </div>
  );
}
