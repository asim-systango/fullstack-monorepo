import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateCourseDto {
  @ApiPropertyOptional({ description: 'The title of the course' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'The URL-friendly course slug' })
  @IsString()
  @Matches(/^[a-z0-9-_]+$/)
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'Optional course description' })
  @IsString()
  @IsOptional()
  description?: string;
}
