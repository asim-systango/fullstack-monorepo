import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientProfile } from './entities/patient-profile.entity';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';

/**
 * PatientModule — manages patient_profiles table.
 *
 * Mirrors the DoctorModule structure:
 *   DoctorModule → doctor_profiles table
 *   PatientModule → patient_profiles table
 *
 * Both tables link to the shared `users` table via userId.
 */
@Module({
  imports: [TypeOrmModule.forFeature([PatientProfile])],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
