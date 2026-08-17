import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BookCopyStatus } from '../enums/book-copy-status.enum';

export class UpdateBookCopyDto {
  @ApiPropertyOptional({
    example: 'BKLY-0100',
    maxLength: 50,
    description: 'Unique barcode; conflicts return 409',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  barcode?: string;

  @ApiPropertyOptional({
    enum: BookCopyStatus,
    description:
      'Staff PATCH may only transition available ↔ lost. Setting on_loan is rejected (use loans checkout/return).',
    example: BookCopyStatus.Lost,
  })
  @IsOptional()
  @IsEnum(BookCopyStatus)
  status?: BookCopyStatus;
}
