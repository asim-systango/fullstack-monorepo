import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'The ID of the course to enroll in', format: 'uuid' })
  @IsUUID()
  courseId!: string;
}
