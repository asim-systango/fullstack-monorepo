import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettlementDto {
  @ApiProperty()
  @IsUUID()
  payerUserId!: string;

  @ApiProperty()
  @IsUUID()
  payeeUserId!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  amountCents!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
