import { IsEnum, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RsvpStatus } from '../entities/rsvp.entity';

export class CreateRsvpDto {
  @IsNotEmpty()
  @IsEnum(RsvpStatus)
  status!: RsvpStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  guestCount?: number;
}
