import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  coverLetter!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  resumeUrl?: string;

  // Lookup-only input: copies ResumeMeta.url into Application.resumeUrl as a snapshot (no live FK).
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  resumeMetaId?: string;
}