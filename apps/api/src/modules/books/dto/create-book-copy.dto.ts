import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBookCopyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  barcode!: string;
}
