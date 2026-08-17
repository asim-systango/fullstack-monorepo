import { IsIn, IsInt, IsOptional, IsString, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { RoomType } from '../room.entity';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['single', 'double', 'suite'])
  type?: RoomType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pricePerNight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  amenities?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
