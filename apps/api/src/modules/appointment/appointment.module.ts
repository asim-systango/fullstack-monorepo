import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { SlotModule } from '../slot';
import { DoctorModule } from '../doctor';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), SlotModule, DoctorModule],
  controllers: [AppointmentController],
  providers: [AppointmentRepository, AppointmentService],
  exports: [AppointmentRepository, AppointmentService],
})
export class AppointmentModule {}
