import { Module } from '@nestjs/common';
import { FhirService } from './fhir.service';
import { ExportController } from './export.controller';
import { AppointmentModule } from '../appointment/appointment.module';

@Module({
  imports: [AppointmentModule],
  controllers: [ExportController],
  providers: [FhirService],
  exports: [FhirService],
})
export class ExportModule {}
