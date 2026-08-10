import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { CheckoutLoanDto } from './dto/checkout-loan.dto';
import { ListLoansQueryDto } from './dto/list-loans-query.dto';
import { LoansService } from './loans.service';

@ApiTags('loans')
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Roles('staff', 'admin', 'user')
  @Get()
  @ApiOperation({ summary: 'List loans' })
  list(@Query() query: ListLoansQueryDto) {
    return this.loansService.list(query);
  }

  @Roles('staff', 'admin')
  @Post('checkout')
  @ApiOperation({ summary: 'Checkout a copy to a member (librarian)' })
  checkout(@Body() dto: CheckoutLoanDto) {
    return this.loansService.checkout(dto);
  }

  @Roles('staff', 'admin')
  @Post(':id/return')
  @ApiOperation({ summary: 'Return a loan (librarian)' })
  returnLoan(@Param('id') id: string) {
    return this.loansService.returnLoan(id);
  }
}
