import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePrescriptionDto } from './create-prescription.dto';

/** DTO for updating a prescription. appointmentId cannot change. */
export class UpdatePrescriptionDto extends PartialType(
  OmitType(CreatePrescriptionDto, ['appointmentId'] as const),
) {}
