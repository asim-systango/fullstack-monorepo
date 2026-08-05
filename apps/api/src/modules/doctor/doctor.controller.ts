import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DoctorService } from './doctor.service';

/**
 * Doctor controller — REST endpoint shell.
 * Endpoints will be added on Day 2.
 */
@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}
}
