import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateBookDto {
  @ApiPropertyOptional({ example: 'Clean Code', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({ example: 'Robert C. Martin', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  author?: string;

  @ApiPropertyOptional({
    example: '9780132350884',
    maxLength: 20,
    description: 'ISBN; duplicates are allowed',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  isbn?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
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
