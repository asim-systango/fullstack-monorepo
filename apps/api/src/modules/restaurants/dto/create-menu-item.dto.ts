import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Butter Chicken' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'Creamy tomato curry, served with rice' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' })
  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @MaxLength(512)
  imageUrl?: string;

  @ApiProperty({ example: 225 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Restaurant that owns this menu item' })
  @IsUUID()
  restaurantId: string;
}
