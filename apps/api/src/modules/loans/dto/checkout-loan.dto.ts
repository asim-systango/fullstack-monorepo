import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CheckoutLoanDto {
  /** Member gateway user id. */
  @IsUUID()
  userId!: string;

  @IsUUID()
  bookCopyId!: string;

  /** Optional ISO date (YYYY-MM-DD). Defaults to today + default_loan_days. */
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
