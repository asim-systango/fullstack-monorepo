import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, In, Repository } from 'typeorm';
import type { PublicUser } from '../users';
import { GroupsService } from '../groups/groups.service';
import { Expense } from './expense.entity';
import { Share } from './share.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenses: Repository<Expense>,
    @InjectRepository(Share)
    private readonly shares: Repository<Share>,
    private readonly groupsService: GroupsService,
  ) {}

  async findByGroup(groupId: string, user: PublicUser, limit = 10) {
    if (!this.groupsService.isPlatformAdmin(user)) {
      await this.groupsService.assertMember(groupId, user.id);
    }

    const rows = await this.expenses.find({
      where: { groupId, deletedAt: IsNull() },
      relations: ['payer'],
      order: { expenseDate: 'DESC' },
      take: Math.min(limit, 50),
    });

    const expenseIds = rows.map((e) => e.id);
    const allShares =
      expenseIds.length > 0
        ? await this.shares.find({ where: { expenseId: In(expenseIds) } })
        : [];

    return rows.map((expense) => ({
      id: expense.id,
      description: expense.description,
      amountCents: expense.amountCents,
      category: expense.category,
      expenseDate: expense.expenseDate.toISOString(),
      payer: {
        id: expense.payer.id,
        name: expense.payer.name,
      },
      shares: allShares
        .filter((s) => s.expenseId === expense.id)
        .map((s) => ({ userId: s.userId, amountCents: s.amountCents })),
    }));
  }

  async findOne(groupId: string, expenseId: string, user: PublicUser) {
    if (!this.groupsService.isPlatformAdmin(user)) {
      await this.groupsService.assertMember(groupId, user.id);
    }

    const expense = await this.expenses.findOne({
      where: { id: expenseId, groupId, deletedAt: IsNull() },
      relations: ['payer', 'createdBy'],
    });
    if (!expense) throw new NotFoundException('Expense not found');

    const shares = await this.shares.find({ where: { expenseId } });

    return {
      id: expense.id,
      description: expense.description,
      amountCents: expense.amountCents,
      category: expense.category,
      expenseDate: expense.expenseDate.toISOString(),
      payer: { id: expense.payer.id, name: expense.payer.name },
      createdBy: { id: expense.createdBy.id, name: expense.createdBy.name },
      shares: shares.map((s) => ({ userId: s.userId, amountCents: s.amountCents })),
    };
  }

  assertGroupNotBlocked(blocked: boolean) {
    if (blocked) throw new ForbiddenException('This group has been blocked');
  }
}
