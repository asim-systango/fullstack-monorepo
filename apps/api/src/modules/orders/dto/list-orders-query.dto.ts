import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { OrderStatus } from '../order.entity';

export enum OrderListScope {
  MINE = 'mine',
  RESTAURANT = 'restaurant',
  ALL = 'all',
}

export class ListOrdersQueryDto {
  @ApiPropertyOptional({
    enum: OrderListScope,
    default: OrderListScope.MINE,
    description:
      'mine = orders you placed · restaurant = incoming for your kitchen (staff) · all = platform (admin)',
  })
  @IsOptional()
  @IsEnum(OrderListScope)
  scope?: OrderListScope = OrderListScope.MINE;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
