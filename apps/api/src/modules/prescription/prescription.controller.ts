import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';

/**
 * Prescription controller — REST endpoint shell.
 * Endpoints will be added on Day 2.
 */
@ApiTags('Prescriptions')
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}
}
