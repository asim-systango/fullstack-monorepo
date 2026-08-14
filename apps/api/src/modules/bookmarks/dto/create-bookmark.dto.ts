import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateBookmarkDto {
  // Identity (userId) comes from @CurrentUser — DTO only carries the job being saved.
  @ApiProperty()
  @IsUUID()
  jobId!: string;
}
