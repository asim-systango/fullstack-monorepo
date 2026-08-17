import { PartialType } from '@nestjs/swagger';
import { CreatePrescriptionDto } from './create-prescription.dto';

/** DTO for updating a prescription. */
export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {}
