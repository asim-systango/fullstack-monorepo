import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SubmissionAnswerDto } from './submission-answer.dto';

export class CreateSubmissionDto {
  @ApiProperty({ description: 'The ID of the quiz being submitted', format: 'uuid' })
  @IsUUID()
  quizId!: string;

  @ApiProperty({
    description: 'The answers for the submission',
    type: [SubmissionAnswerDto],
  })
  @ValidateNested({ each: true })
  @Type(() => SubmissionAnswerDto)
  @ArrayMinSize(1)
  answers!: SubmissionAnswerDto[];
}
