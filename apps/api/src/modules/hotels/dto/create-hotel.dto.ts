import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  /**
   * Manager userId from the gateway.
   * If omitted, defaults to the authenticated user.
   */
  @IsUUID()
  @IsOptional()
  managerId?: string;
}
