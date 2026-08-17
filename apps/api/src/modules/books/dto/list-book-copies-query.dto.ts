import { IsEnum, IsOptional } from 'class-validator';
import { BookCopyStatus } from '../enums/book-copy-status.enum';

export class ListBookCopiesQueryDto {
  @IsOptional()
  @IsEnum(BookCopyStatus)
  status?: BookCopyStatus;
}
