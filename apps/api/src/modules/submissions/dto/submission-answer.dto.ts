import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class SubmissionAnswerDto {
  @ApiProperty({ description: 'The ID of the question being answered', format: 'uuid' })
  @IsUUID()
  questionId!: string;

  @ApiProperty({ description: 'The provided answer text' })
  @IsString()
  @IsNotEmpty()
  answer!: string;
}
