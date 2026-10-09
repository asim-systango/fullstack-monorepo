import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateGradeDto {
  @ApiProperty({ description: 'The ID of the submission to grade', format: 'uuid' })
  @IsUUID()
  submissionId!: string;

  @ApiProperty({
    description: 'The score awarded for the submission',
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;

  @ApiPropertyOptional({ description: 'Optional feedback for the submission' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
