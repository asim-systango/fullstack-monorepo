import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

/** DTO for creating a prescription for a completed appointment. */
export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Appointment UUID (must be COMPLETED)' })
  @IsUUID()
  @IsNotEmpty()
  appointmentId!: string;

  @ApiProperty({
    description: 'List of prescribed medicines',
    example: [{ name: 'Aspirin', dosage: '100mg', frequency: 'Once daily' }],
  })
  @IsArray()
  @IsNotEmpty()
  medicines!: Record<string, unknown>[];

  @ApiPropertyOptional({
    description: 'Additional instructions',
    example: 'Take with food. Avoid alcohol.',
  })
  @IsString()
  @IsOptional()
  instructions?: string;
}
