import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FormSubmissionStatus } from '../../../database/entities/form-submission.entity';

export class UpdateFormSubmissionStatusDto {
  @ApiProperty({
    description: 'New status for the form submission request',
    enum: FormSubmissionStatus,
    example: FormSubmissionStatus.IN_REVIEW,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(FormSubmissionStatus, {
    message: 'Status must be one of PENDING, IN_REVIEW, APPROVED, or REJECTED',
  })
  status!: FormSubmissionStatus;

  @ApiPropertyOptional({
    description: 'Optional review notes or feedback from the Super Admin',
    example: 'Onboarding request verified. Enterprise tier granted.',
  })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
