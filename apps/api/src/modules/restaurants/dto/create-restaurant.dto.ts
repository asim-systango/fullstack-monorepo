import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Hasty Tasty' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'Indian' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  cuisine: string;

  @ApiProperty({ example: '142 Rajwada Road, Indore' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  address: string;

  @ApiPropertyOptional({ example: 'Homestyle curries and fresh naan.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '🍛' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  emoji?: string;

  @ApiPropertyOptional({ example: '25-35 min' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  eta?: string;

  @ApiProperty({
    description: 'Staff user id who will own this restaurant',
    example: '00000000-0000-4000-8000-000000000002',
  })
  @IsUUID()
  ownerUserId: string;
}
