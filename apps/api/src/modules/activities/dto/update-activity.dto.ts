import { IsString, IsOptional, MaxLength, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateActivityDto {
  @ApiPropertyOptional({
    description: 'Title of the activity',
    example: 'Follow-up Call',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description or notes for the activity',
    example: 'Discussed next steps',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Due date in epoch milliseconds',
    example: 1756446803506,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  dueAt?: number;

  @ApiPropertyOptional({
    description: 'Completed date in epoch milliseconds',
    example: 1756446803506,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  completedAt?: number;
}
