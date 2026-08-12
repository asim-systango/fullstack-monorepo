import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from './common/auth';
import { AuditLoggerInterceptor } from './common/interceptors/audit-logger.interceptor';
import { databaseConfig } from './config';
import { AuthModule } from './modules/auth';
import { HealthModule } from './modules/health';
import { DoctorModule } from './modules/doctor';
import { SlotModule } from './modules/slot';
import { AppointmentModule } from './modules/appointment';
import { PrescriptionModule } from './modules/prescription';
import { MedicalNoteModule } from './modules/medical-note';
import { PaymentModule } from './modules/payment/payment.module';
import { UploadModule } from './modules/upload/upload.module';
import { ExportModule } from './modules/export';
import { NotificationModule } from './modules/notification';

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
    PaymentModule,
    UploadModule,
    ExportModule,
    NotificationModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditLoggerInterceptor },
  ],
})
export class AppModule {}
