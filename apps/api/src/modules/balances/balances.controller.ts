import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { BalancesService } from './balances.service';
import { EmployeeBalancesQueryDto, MyBalancesQueryDto } from './dto/balance-query.dto';
import { UpsertBalanceDto } from './dto/upsert-balance.dto';

@ApiTags('balances')
@ApiBearerAuth()
@Controller('balances')
export class BalancesController {
  constructor(private readonly balances: BalancesService) {}

  @Get('me')
  @Roles('user', 'staff')
  @ApiOperation({ summary: 'My balance per leave type (current year by default)' })
  mine(@CurrentUser() user: JwtUser, @Query() query: MyBalancesQueryDto) {
    return this.balances.mine(user.id, query.year);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: "An employee's balance per leave type" })
  forEmployee(@Query() query: EmployeeBalancesQueryDto) {
    return this.balances.forEmployee(query.userId, query.year);
  }

  @Put()
  @Roles('admin')
  @ApiOperation({ summary: 'Set total days for one employee, leave type and year' })
  upsert(@Body() dto: UpsertBalanceDto) {
    return this.balances.upsert(dto);
  }
}
