import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AvailabilityQueryDto {
  @IsOptional()
  @IsUUID()
  hotelId?: string;

  @IsDateString()
  @IsNotEmpty()
  checkIn!: string;

  @IsDateString()
  @IsNotEmpty()
  checkOut!: string;
}
