import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SlaPriority } from '../../categories/sla-priority.enum';

export class CreateTicketDto {
  @ApiProperty({ example: 'Cannot access payment gateway dashboard' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  subject!: string;

  @ApiProperty({
    example: 'Getting 500 internal server error when clicking settings tab.',
  })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ enum: SlaPriority, default: SlaPriority.MEDIUM })
  @IsOptional()
  @IsEnum(SlaPriority)
  priority?: SlaPriority;

  @ApiPropertyOptional({ example: { browser: 'Chrome 120', os: 'Linux' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
