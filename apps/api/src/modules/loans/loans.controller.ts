import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { CheckoutLoanDto } from './dto/checkout-loan.dto';
import { ListLoansQueryDto } from './dto/list-loans-query.dto';
import { LookupLoanQueryDto } from './dto/lookup-loan-query.dto';
import { LoansService } from './loans.service';

@ApiTags('loans')
@ApiBearerAuth()
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Roles('staff', 'admin')
  @Get()
  @ApiOperation({ summary: 'List all loans (staff/admin)' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  list(@Query() query: ListLoansQueryDto) {
    return this.loansService.list(query);
  }

  @Roles('staff')
  @Get('lookup')
  @ApiOperation({ summary: 'Lookup active loan by barcode, userId, or loanId' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  lookup(@Query() query: LookupLoanQueryDto) {
    return this.loansService.lookup(query);
  }

  @Roles('staff', 'admin')
  @Get('overdue')
  @ApiOperation({ summary: 'Overdue loans queue' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  overdue(@Query() query: ListLoansQueryDto) {
    return this.loansService.listOverdue(query);
  }

  @Roles('staff', 'admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get one loan' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.loansService.findOne(id);
  }

  @Roles('staff')
  @Post('checkout')
  @ApiOperation({ summary: 'Checkout a copy to a member (librarian)' })
  @ApiCreatedResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  checkout(@Body() dto: CheckoutLoanDto, @CurrentUser() user: JwtUser) {
    return this.loansService.checkout(dto, user.id);
  }

  @Roles('staff')
  @Post(':id/return')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return a loan (librarian)' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  returnLoan(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.loansService.returnLoan(id, user.id);
  }
}

@ApiTags('loans')
@ApiBearerAuth()
@Controller('my/loans')
export class MyLoansController {
  constructor(private readonly loansService: LoansService) {}

  @Roles('user')
  @Get()
  @ApiOperation({ summary: 'Authenticated member own loans' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  listMine(@CurrentUser() user: JwtUser, @Query() query: ListLoansQueryDto) {
    return this.loansService.listMine(user.id, query);
  }
}
