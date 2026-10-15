import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/** DTO for updating a medical note (only notes text). */
export class UpdateMedicalNoteDto {
  @ApiPropertyOptional({ description: 'Updated clinical notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
