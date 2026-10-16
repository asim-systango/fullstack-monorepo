import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookCopyStatus } from '../enums/book-copy-status.enum';

/** Swagger schema for a catalog book (wrapped in `{ data }` by the response interceptor). */
export class BookResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  author!: string;

  @ApiProperty()
  isbn!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 2008 })
  publishedYear!: number | null;

  @ApiProperty({
    format: 'uuid',
    description: 'Gateway staff user id that created the book',
  })
  createdBy!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  deletedAt!: Date | null;
}

export class BookDetailResponseDto extends BookResponseDto {
  @ApiProperty({ description: 'Non-deleted physical copies' })
  totalCopies!: number;

  @ApiProperty({ description: 'Copies with status available' })
  availableCopies!: number;

  @ApiProperty({ description: 'Copies with status on_loan' })
  onLoanCopies!: number;
}

export class PaginatedBooksResponseDto {
  @ApiProperty({ type: [BookResponseDto] })
  items!: BookResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

export class BookCopyResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  bookId!: string;

  @ApiProperty()
  barcode!: string;

  @ApiProperty({ enum: BookCopyStatus })
  status!: BookCopyStatus;

  @ApiPropertyOptional({ nullable: true, example: '2024-06-01' })
  acquiredAt!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  deletedAt!: Date | null;
}
