import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { MovementType } from '../../../database/entities/StockMovementEntity';

export class CreateMovementDto {
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @IsUUID()
  @IsOptional()
  sourceWarehouseId?: string;

  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsEnum(['inbound', 'outbound', 'adjustment', 'transfer'])
  @IsNotEmpty()
  type!: MovementType;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;
}
