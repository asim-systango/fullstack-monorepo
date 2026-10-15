import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDoctorDto } from './create-doctor.dto';

/**
 * DTO for updating a doctor profile.
 * userId is excluded — it cannot be changed after creation.
 */
export class UpdateDoctorDto extends PartialType(
  OmitType(CreateDoctorDto, ['userId'] as const),
) {}
