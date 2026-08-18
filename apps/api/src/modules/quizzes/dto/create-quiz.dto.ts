import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class CreateQuizDto {
  @ApiProperty({ description: 'The ID of the course that owns the quiz', format: 'uuid' })
  @IsUUID()
  courseId!: string;

  @ApiProperty({ description: 'The title of the quiz' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'The quiz due date' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @ApiProperty({
    description: 'The list of questions on the quiz',
    type: [CreateQuestionDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @ArrayMinSize(1)
  questions!: CreateQuestionDto[];
}
