import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'The ID of the course this lesson belongs to',
    format: 'uuid',
  })
  @IsUUID()
  courseId!: string;

  @ApiProperty({ description: 'The title of the lesson' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Optional lesson content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Lesson position within the course', minimum: 1 })
  @IsInt()
  @Min(1)
  position!: number;
}
