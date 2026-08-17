import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { CheckoutRequestStatus } from '../enums/checkout-request-status.enum';

export class ListCheckoutRequestsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  bookId?: string;

  @IsOptional()
  @IsEnum(CheckoutRequestStatus)
  status?: CheckoutRequestStatus;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}
