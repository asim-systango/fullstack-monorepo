import { IsUUID } from 'class-validator';

export class CreateCheckoutRequestDto {
  @IsUUID()
  bookId!: string;
}
