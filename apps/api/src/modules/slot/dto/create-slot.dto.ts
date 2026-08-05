import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

/** DTO for creating a new consultation slot. */
export class CreateSlotDto {
  @ApiProperty({ description: 'Doctor profile UUID' })
  @IsUUID()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({
    description: 'Slot start time (ISO 8601)',
    example: '2026-08-10T09:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startsAt!: string;

  @ApiPropertyOptional({
    description: 'Slot end time (ISO 8601). Defaults to startsAt + 30 minutes.',
    example: '2026-08-10T09:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  endsAt?: string;
}
