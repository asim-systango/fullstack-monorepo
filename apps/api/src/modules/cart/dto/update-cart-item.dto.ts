import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Set quantity. Use 0 to remove the item from the cart.',
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  quantity: number;
}
