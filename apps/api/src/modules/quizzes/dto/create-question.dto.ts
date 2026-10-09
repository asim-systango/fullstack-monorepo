import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ description: 'The question type', enum: ['mcq', 'short_answer'] })
  @IsString()
  @IsIn(['mcq', 'short_answer'])
  type!: 'mcq' | 'short_answer';

  @ApiProperty({ description: 'The question prompt' })
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @ApiPropertyOptional({ description: 'The correct answer for the question' })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({
    description: 'The list of choices for multiple-choice questions',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  choices?: string[];

  @ApiProperty({ description: 'The display order of the question', minimum: 1 })
  @IsInt()
  @Min(1)
  position!: number;
}
