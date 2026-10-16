import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectCheckoutRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
