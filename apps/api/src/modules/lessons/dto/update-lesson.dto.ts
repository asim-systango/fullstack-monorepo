import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateLessonDto {
  @ApiPropertyOptional({ description: 'The title of the lesson' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Optional lesson content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Lesson position within the course', minimum: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  position?: number;
}
