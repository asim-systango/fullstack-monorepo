import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth';
import type { PublicUser } from '../users';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { ExpensesService } from './expenses.service';

@ApiTags('expenses')
@ApiCookieAuth('access_token')
@Controller('groups/:groupId/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an expense with shares' })
  create(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() dto: CreateExpenseDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.expensesService.create(groupId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List expenses for a group' })
  findAll(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Query('payerUserId') payerUserId: string | undefined,
    @Query('q') q: string | undefined,
    @Query('category') category: string | undefined,
    @Query('sortBy') sortBy: 'expenseDate' | 'amountCents' | 'description' | undefined,
    @Query('sortDir') sortDir: 'ASC' | 'DESC' | undefined,
    @CurrentUser() user: PublicUser,
  ) {
    return this.expensesService.findByGroup(groupId, user, {
      limit,
      page,
      from,
      to,
      payerUserId,
      q,
      category,
      sortBy,
      sortDir,
    });
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Audit list of soft-deleted expenses' })
  findDeleted(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.expensesService.findDeleted(groupId, user);
  }

  @Get(':expenseId')
  @ApiOperation({ summary: 'Expense detail' })
  findOne(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.expensesService.findOne(groupId, expenseId, user);
  }

  @Patch(':expenseId')
  @ApiOperation({ summary: 'Edit expense and replace shares (group admin)' })
  update(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
    @Body() dto: UpdateExpenseDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.expensesService.update(groupId, expenseId, dto, user);
  }

  @Delete(':expenseId')
  @ApiOperation({ summary: 'Soft-delete an expense (group admin)' })
  remove(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.expensesService.softDelete(groupId, expenseId, user);
  }
}
