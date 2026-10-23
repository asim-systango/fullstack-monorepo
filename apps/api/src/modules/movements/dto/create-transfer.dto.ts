import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateTransferDto {
  @IsUUID()
  @IsNotEmpty()
  sourceWarehouseId!: string;

  @IsUUID()
  @IsNotEmpty()
  destWarehouseId!: string;

  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
