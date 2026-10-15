'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Badge,
  Button,
} from '@shared/ui/components';
import { Stethoscope, CalendarCheck, Star, Clock, MapPin } from 'lucide-react';

export type DoctorInfo = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experienceYears: number;
  location: string;
  consultationFee: number;
  availableDays: string[];
};

type DoctorCardProps = {
  doctor: DoctorInfo;
  onBookClick: (doctor: DoctorInfo) => void;
};

export function DoctorCard({ doctor, onBookClick }: Readonly<DoctorCardProps>) {
  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-all duration-200 shadow-xs hover:shadow-md">
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold shadow-xs">
                <Stethoscope className="size-6" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  {doctor.name}
                </CardTitle>
                <Badge tone="neutral" className="mt-1 text-[10px]">
                  {doctor.specialty}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              {doctor.rating.toFixed(1)}
            </div>
          </div>
        </CardHeader>

        <CardBody className="py-2 text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-primary" />
            <span>{doctor.experienceYears} Years Clinical Experience</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 text-primary" />
            <span>{doctor.location}</span>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-border/50 text-xs">
            <span className="text-muted-foreground">Consultation Fee</span>
            <span className="font-bold text-foreground text-sm">
              ${doctor.consultationFee}
            </span>
          </div>
        </CardBody>
      </div>

      <CardFooter className="pt-4 border-t border-border/40">
        <Button
          variant="primary"
          size="sm"
          className="w-full gap-2 font-medium"
          onClick={() => onBookClick(doctor)}
        >
          <CalendarCheck className="size-4" /> Book Consultation
        </Button>
      </CardFooter>
    </Card>
  );
}
