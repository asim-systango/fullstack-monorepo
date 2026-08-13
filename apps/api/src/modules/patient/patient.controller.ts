import { Controller, Get, Param, Patch, Body, ParseUUIDPipe } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientProfile } from './entities/patient-profile.entity';
import { Roles } from '../../common/auth/decorators/roles.decorator';

/**
 * Patient profile controller.
 *
 * Endpoints:
 *   GET  /patients              → list all patient profiles  (ADMIN only)
 *   GET  /patients/:id          → get a profile by profile id
 *   GET  /patients/by-user/:uid → get a profile by user id
 *   PATCH /patients/:id         → update a profile
 */
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  /** List all patient profiles — admin use only. */
  @Get()
  @Roles('ADMIN')
  findAll(): Promise<PatientProfile[]> {
    return this.patientService.findAll();
  }

  /** Get a single patient profile by profile id. */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PatientProfile> {
    return this.patientService.findOne(id);
  }

  /** Get a patient profile by user id (used internally by appointment module). */
  @Get('by-user/:userId')
  findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<PatientProfile | null> {
    return this.patientService.findByUserId(userId);
  }

  /** Update patient profile fields (patient updates their own profile). */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Partial<PatientProfile>,
  ): Promise<PatientProfile> {
    return this.patientService.update(id, body);
  }
}
