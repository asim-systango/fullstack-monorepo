import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpenseShareDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  amountCents!: number;
}

export class CreateExpenseDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  amountCents!: number;

  @ApiProperty()
  @IsUUID()
  payerUserId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty()
  @IsISO8601()
  expenseDate!: string;

  @ApiProperty({ type: [ExpenseShareDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExpenseShareDto)
  shares!: ExpenseShareDto[];
}

export class UpdateExpenseDto extends CreateExpenseDto {}
