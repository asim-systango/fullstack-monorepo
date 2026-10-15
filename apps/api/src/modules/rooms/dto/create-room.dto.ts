import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { RoomType } from '../room.entity';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsIn(['single', 'double', 'suite'])
  type!: RoomType;

  /** Price per night in cents */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pricePerNight!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  amenities?: string;
}
