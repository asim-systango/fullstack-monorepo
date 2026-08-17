import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { AppointmentStatus } from '../../../shared/enums/appointment-status.enum';

/** DTO for updating an appointment (status or reason). */
export class UpdateAppointmentDto {
  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
