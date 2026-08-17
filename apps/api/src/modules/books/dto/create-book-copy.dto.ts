import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBookCopyDto {
  @ApiProperty({
    example: 'BKLY-0100',
    maxLength: 50,
    description: 'Unique barcode for this physical copy',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  barcode!: string;

  @ApiPropertyOptional({
    example: '2024-06-01',
    description: 'Acquisition date (ISO date string YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  acquiredAt?: string;
}
