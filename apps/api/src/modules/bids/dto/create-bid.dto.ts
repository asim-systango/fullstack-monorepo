import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';
import { MONEY_MAX } from '../../../common/money';

export class CreateBidDto {
  @ApiProperty({ example: 550, minimum: 0.01, maximum: MONEY_MAX })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(MONEY_MAX)
  bidAmount!: number;
}
