import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
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

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' })
  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @MaxLength(512)
  imageUrl?: string;

  @ApiPropertyOptional({ example: '25-35 min' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  eta?: string;

  @ApiPropertyOptional({ example: 4.5, description: 'Initial rating between 0 and 5' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({
    description: 'Restaurant contact email — staff login credentials are sent here',
    example: 'kitchen@hastytasty.com',
  })
  @IsEmail()
  ownerEmail: string;

  @ApiPropertyOptional({
    description: 'Existing staff user id (internal/seed use only)',
    example: '00000000-0000-4000-8000-000000000002',
  })
  @IsOptional()
  @IsUUID()
  ownerUserId?: string;
}
