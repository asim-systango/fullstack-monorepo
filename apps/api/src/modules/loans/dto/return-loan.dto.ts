import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class ReturnLoanDto {
  /** Required when the copy is overdue and the fine is not already paid or waived. */
  @ApiPropertyOptional({ enum: ['paid', 'unpaid'] })
  @IsOptional()
  @IsIn(['paid', 'unpaid'])
  fineSettlement?: 'paid' | 'unpaid';
}
