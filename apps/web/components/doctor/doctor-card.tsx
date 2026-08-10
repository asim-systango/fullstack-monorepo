'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardFooter, Badge, Button } from '@shared/ui/components';
import type { DoctorProfile } from '@/features/doctor/types';
import { Stethoscope, Award, IndianRupee, Calendar } from 'lucide-react';

export interface DoctorCardProps {
  doctor: DoctorProfile;
}

export function DoctorCard({ doctor }: Readonly<DoctorCardProps>) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-md border-border/60 hover:border-primary/40 bg-card p-6">
      <div className="flex-1 flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0 border border-primary/20">
            {doctor.profileImage ? (
              <img
                src={doctor.profileImage}
                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {doctor.firstName[0]}
                {doctor.lastName[0]}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-primary font-medium mt-0.5">
              <Stethoscope className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{doctor.specialization}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {doctor.qualification}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge tone="accent" className="gap-1 text-xs">
            <Award className="w-3 h-3" />
            {doctor.experienceYears} Years Exp.
          </Badge>
          <Badge tone="success" className="gap-1 text-xs">
            <IndianRupee className="w-3 h-3" />₹{doctor.consultationFee} Fee
          </Badge>
        </div>

        {doctor.biography && (
          <p className="text-xs text-muted-foreground line-clamp-3 mt-auto">
            {doctor.biography}
          </p>
        )}
      </div>

      <CardFooter className="mt-4 pt-4 border-t border-border/40 p-0 flex gap-2">
        <Link href={`/doctor/${doctor.id}`} className="w-full">
          <Button variant="primary" className="w-full gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            View Schedule & Book
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
