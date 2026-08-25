import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignAthleteDto {
  @ApiProperty()
  @IsUUID()
  coachUserId!: string;

  @ApiProperty()
  @IsUUID()
  athleteUserId!: string;
}
