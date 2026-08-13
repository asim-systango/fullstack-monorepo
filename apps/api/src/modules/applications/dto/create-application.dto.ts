import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

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
}