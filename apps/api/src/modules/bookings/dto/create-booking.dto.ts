import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  roomId!: string;

  @IsDateString()
  @IsNotEmpty()
  checkIn!: string;

  @IsDateString()
  @IsNotEmpty()
  checkOut!: string;
}
