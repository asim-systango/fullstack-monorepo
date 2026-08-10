'use client';

import { Page, PageHeader } from '@shared/ui/components';
import { DoctorFilter, DoctorList, type DoctorInfo } from '@/components/doctors';
import { BookingWizardModal } from '@/components/appointments';
import { useUiStore, useAppointmentStore } from '@/lib/store';
import { useState, useMemo } from 'react';

const MOCK_DOCTORS: DoctorInfo[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins',
    specialty: 'CARDIOLOGY',
    rating: 4.9,
    experienceYears: 12,
    location: 'Building A, Suite 302',
    consultationFee: 150,
    availableDays: ['Mon', 'Wed', 'Fri'],
  },
  {
    id: 'doc-2',
    name: 'Dr. Michael Chen',
    specialty: 'NEUROLOGY',
    rating: 4.8,
    experienceYears: 9,
    location: 'Building B, Suite 105',
    consultationFee: 180,
    availableDays: ['Tue', 'Thu'],
  },
  {
    id: 'doc-3',
    name: 'Dr. Emily Vance',
    specialty: 'DERMATOLOGY',
    rating: 4.95,
    experienceYears: 14,
    location: 'Building C, Suite 410',
    consultationFee: 160,
    availableDays: ['Mon', 'Tue', 'Thu'],
  },
  {
    id: 'doc-4',
    name: 'Dr. Robert Garcia',
    specialty: 'PEDIATRICS',
    rating: 4.7,
    experienceYears: 7,
    location: 'Building A, Suite 112',
    consultationFee: 130,
    availableDays: ['Wed', 'Fri', 'Sat'],
  },
];

export default function DoctorsPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const searchQuery = useUiStore((state) => state.searchQuery);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const setBookingModalOpen = useUiStore((state) => state.setBookingModalOpen);
  const selectDoctor = useAppointmentStore((state) => state.selectDoctor);

  const filteredDoctors = useMemo(() => {
    return MOCK_DOCTORS.filter((doc) => {
      const matchesSpecialty =
        selectedSpecialty === 'ALL' || doc.specialty === selectedSpecialty;
      const matchesQuery =
        searchQuery === '' || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSpecialty && matchesQuery;
    });
  }, [selectedSpecialty, searchQuery]);

  const handleBookClick = (doctor: DoctorInfo) => {
    selectDoctor(doctor.id, doctor.name);
    setBookingModalOpen(true);
  };

  const handleReset = () => {
    setSelectedSpecialty('ALL');
    setSearchQuery('');
  };

  return (
    <Page>
      <PageHeader
        title="Find a Specialist Doctor"
        description="Explore board-certified medical experts and book instant consultation slots."
      />

      <DoctorFilter
        selectedSpecialty={selectedSpecialty}
        onSpecialtyChange={setSelectedSpecialty}
        onReset={handleReset}
      />

      <DoctorList doctors={filteredDoctors} onBookDoctor={handleBookClick} />

      <BookingWizardModal />
    </Page>
  );
}
