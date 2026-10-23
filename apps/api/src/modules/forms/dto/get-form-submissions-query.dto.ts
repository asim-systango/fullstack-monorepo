import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  FormSubmissionStatus,
  FormType,
} from '../../../database/entities/form-submission.entity';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetFormSubmissionsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page number must be at least 1' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Search term to filter by contact name, email, or company name',
    example: 'Systango',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter submissions by form type',
    enum: FormType,
    example: FormType.ORGANIZATION_ONBOARDING_REQUEST,
  })
  @IsOptional()
  @IsEnum(FormType, { message: 'Invalid form type specified' })
  formType?: FormType;

  @ApiPropertyOptional({
    description: 'Filter submissions by status',
    enum: FormSubmissionStatus,
    example: FormSubmissionStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(FormSubmissionStatus, { message: 'Invalid status specified' })
  status?: FormSubmissionStatus;

  @ApiPropertyOptional({
    description: 'Sort order by creation timestamp',
    enum: SortOrder,
    default: SortOrder.DESC,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be ASC or DESC' })
  sortOrder: SortOrder = SortOrder.DESC;
}
