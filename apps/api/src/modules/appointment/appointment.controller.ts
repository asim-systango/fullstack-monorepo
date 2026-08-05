import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';

/**
 * Appointment controller — REST endpoint shell.
 * Endpoints will be added on Day 2.
 */
@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}
}
