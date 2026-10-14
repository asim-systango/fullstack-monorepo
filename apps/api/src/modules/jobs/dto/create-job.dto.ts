// apps/api/src/modules/jobs/dto/create-job.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  location!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description!: string;
}