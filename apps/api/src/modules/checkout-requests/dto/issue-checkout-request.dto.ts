import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class IssueCheckoutRequestDto {
  @IsUUID()
  bookCopyId!: string;

  /** Optional ISO date (YYYY-MM-DD). Defaults to today + default_loan_days. */
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
