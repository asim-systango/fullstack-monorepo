import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from './common/auth';
import { databaseConfig } from './config';
import { AuthModule } from './modules/auth';
import { HealthModule } from './modules/health';
import { DoctorModule } from './modules/doctor';
import { SlotModule } from './modules/slot';
import { AppointmentModule } from './modules/appointment';
import { PrescriptionModule } from './modules/prescription';
import { MedicalNoteModule } from './modules/medical-note';

const db = databaseConfig();

/**
 * Internal domain API — Bearer JWT only (cookie auth lives on api-gateway).
 * Domain modules registered here. Entities auto-loaded via TypeOrmModule.forFeature.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...db,
    }),
    AuthModule,
    HealthModule,
    DoctorModule,
    SlotModule,
    AppointmentModule,
    PrescriptionModule,
    MedicalNoteModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
