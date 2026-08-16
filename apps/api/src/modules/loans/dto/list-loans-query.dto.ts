import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class ListLoansQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  bookId?: string;

  /** Derived status filter. */
  @IsOptional()
  @IsIn(['active', 'returned', 'overdue'])
  status?: 'active' | 'returned' | 'overdue';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}
