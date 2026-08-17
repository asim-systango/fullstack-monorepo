import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'Clean Code', maxLength: 300 })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title!: string;

  @ApiProperty({ example: 'Robert C. Martin', maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  author!: string;

  @ApiProperty({
    example: '9780132350884',
    maxLength: 20,
    description: 'ISBN; duplicates are allowed',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  isbn!: string;

  @ApiPropertyOptional({
    example: 'A handbook of agile software craftsmanship.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 2008, minimum: 1000, maximum: 9999 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(9999)
  publishedYear?: number;
}
