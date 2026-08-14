import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth';
import type { PublicUser } from '../users';
import { ExpensesService } from './expenses.service';

@ApiTags('expenses')
@ApiCookieAuth('access_token')
@Controller('groups/:groupId/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'List expenses for a group' })
  findAll(
    @Param('groupId') groupId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @CurrentUser() user: PublicUser,
  ) {
    return this.expensesService.findByGroup(groupId, user, limit);
  }

  @Get(':expenseId')
  @ApiOperation({ summary: 'Expense detail' })
  findOne(
    @Param('groupId') groupId: string,
    @Param('expenseId') expenseId: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.expensesService.findOne(groupId, expenseId, user);
  }
}
