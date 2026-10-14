import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  coverLetter!: string;

  // Direct URL still allowed for candidates without a saved resume — kept for backward compat.
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  resumeUrl?: string;

  // Optional pick from the candidate's ResumeMeta collection — takes priority over resumeUrl if both are sent.
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  resumeMetaId?: string;
}
