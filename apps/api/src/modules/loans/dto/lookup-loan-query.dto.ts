import { IsOptional, IsUUID, ValidateIf, IsString, MaxLength } from 'class-validator';

/** Exactly one of barcode, userId, or loanId should be provided. */
export class LookupLoanQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ValidateIf((o: LookupLoanQueryDto) => !o.barcode && !o.loanId)
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  loanId?: string;
}
