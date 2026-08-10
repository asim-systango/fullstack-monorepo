import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { SlotModule } from '../slot';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), SlotModule],
  controllers: [AppointmentController],
  providers: [AppointmentRepository, AppointmentService],
  exports: [AppointmentRepository, AppointmentService],
})
export class AppointmentModule {}
