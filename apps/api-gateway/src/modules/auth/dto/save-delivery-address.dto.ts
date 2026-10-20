import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SaveDeliveryAddressDto {
  @ApiProperty({ example: '21 MG Road, Apt 4B, Indore' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  deliveryAddress!: string;
}
