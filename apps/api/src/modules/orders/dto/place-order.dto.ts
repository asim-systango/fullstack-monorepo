import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PlaceOrderDto {
  @ApiProperty({ example: '21 MG Road, Apt 4B, Indore' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  deliveryAddress: string;
}
