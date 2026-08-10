import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BookCopyStatus } from '../enums/book-copy-status.enum';

export class UpdateBookCopyDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  barcode?: string;

  @IsOptional()
  @IsEnum(BookCopyStatus)
  status?: BookCopyStatus;
}
