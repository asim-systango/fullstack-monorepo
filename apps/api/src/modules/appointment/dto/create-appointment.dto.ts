import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * DTO for booking an appointment.
 * patientId is extracted from JWT — never from request body.
 */
export class CreateAppointmentDto {
  @ApiProperty({ description: 'Slot UUID to book' })
  @IsUUID()
  @IsNotEmpty()
  slotId!: string;

  @ApiPropertyOptional({
    description: 'Reason for the visit',
    example: 'Annual heart checkup',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
