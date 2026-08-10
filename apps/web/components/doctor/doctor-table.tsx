'use client';

import React from 'react';
import Link from 'next/link';
import {
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
} from '@shared/ui/components';
import type { DoctorProfile } from '@/features/doctor/types';
import { Stethoscope, Calendar, ChevronRight } from 'lucide-react';

export interface DoctorTableProps {
  doctors: DoctorProfile[];
}

export function DoctorTable({ doctors }: Readonly<DoctorTableProps>) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Doctor Name</TableHeaderCell>
          <TableHeaderCell>Specialization</TableHeaderCell>
          <TableHeaderCell>Experience</TableHeaderCell>
          <TableHeaderCell>Consultation Fee</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell className="text-right">Action</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {doctors.map((doctor) => (
          <TableRow key={doctor.id}>
            <TableCell className="font-medium">
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
                  <div className="text-xs text-muted-foreground">
                    {doctor.qualification}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5 text-sm">
                <Stethoscope className="w-3.5 h-3.5 text-primary" />
                <span>{doctor.specialization}</span>
              </div>
            </TableCell>
            <TableCell>{doctor.experienceYears} Years</TableCell>
            <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
              ₹{doctor.consultationFee}
            </TableCell>
            <TableCell>
              <Badge tone={doctor.isActive ? 'success' : 'neutral'}>
                {doctor.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/doctor/${doctor.id}`}>
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  <Calendar className="w-3.5 h-3.5" />
                  Book Slot
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
