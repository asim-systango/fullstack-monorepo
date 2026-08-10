import { IsUUID } from 'class-validator';

export class CheckoutLoanDto {
  /** Member gateway user id. */
  @IsUUID()
  userId!: string;

  @IsUUID()
  bookCopyId!: string;
}
