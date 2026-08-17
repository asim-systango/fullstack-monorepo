'use client';

import React from 'react';
import Link from 'next/link';
import { PaginatedTable, Badge, Button, type ColumnDef } from '@shared/ui/components';
import type { DoctorProfile } from '@/features/doctor/types';
import { Stethoscope, Calendar, ChevronRight } from 'lucide-react';

export interface DoctorTableProps {
  doctors: DoctorProfile[];
}

export function DoctorTable({ doctors }: Readonly<DoctorTableProps>) {
  const columns: ColumnDef<DoctorProfile>[] = [
    {
      header: 'Doctor Name',
      className: 'font-medium',
      cell: (doctor) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {doctor.profileImage ? (
              <img
                src={doctor.profileImage}
                alt={`Dr. ${doctor.firstName}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              `${doctor.firstName[0]}${doctor.lastName[0]}`
            )}
          </div>
          <div>
            <div className="font-semibold text-foreground">
              Dr. {doctor.firstName} {doctor.lastName}
            </div>
            <div className="text-xs text-muted-foreground">{doctor.qualification}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Specialization',
      cell: (doctor) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Stethoscope className="w-3.5 h-3.5 text-primary" />
          <span>{doctor.specialization}</span>
        </div>
      ),
    },
    {
      header: 'Experience',
      cell: (doctor) => <span>{doctor.experienceYears} Years</span>,
    },
    {
      header: 'Consultation Fee',
      className: 'font-medium text-emerald-600 dark:text-emerald-400',
      cell: (doctor) => <span>₹{doctor.consultationFee}</span>,
    },
    {
      header: 'Status',
      cell: (doctor) => (
        <Badge tone={doctor.isActive ? 'success' : 'neutral'}>
          {doctor.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Action',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (doctor) => (
        <Link href={`/doctor/${doctor.id}`}>
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            <Calendar className="w-3.5 h-3.5" />
            Book Slot
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <PaginatedTable
      columns={columns}
      data={doctors}
      pageSize={10}
      keyExtractor={(doc) => doc.id}
      emptyMessage="No doctors available in the directory."
    />
  );
}
