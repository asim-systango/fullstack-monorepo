import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ description: 'The title of the course', minLength: 1, maxLength: 60 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(60)
  title!: string;

  @ApiProperty({ description: 'The URL-friendly course slug', pattern: '^[a-z0-9-_]+$' })
  @IsString()
  @Matches(/^[a-z0-9-_]+$/)
  slug!: string;

  @ApiPropertyOptional({ description: 'Optional course description', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
