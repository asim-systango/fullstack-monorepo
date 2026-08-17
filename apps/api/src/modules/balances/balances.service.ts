import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, In, Repository } from 'typeorm';
import type { PublicUser } from '../users';
import { Expense } from '../expenses/expense.entity';
import { Share } from '../expenses/share.entity';
import { GroupMember } from '../groups/group-member.entity';
import { Group } from '../groups/group.entity';
import { GroupsService } from '../groups/groups.service';
import { Settlement } from '../settlements/settlement.entity';

type NetMap = Map<string, number>;

@Injectable()
export class BalancesService {
  constructor(
    @InjectRepository(Group)
    private readonly groups: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly members: Repository<GroupMember>,
    @InjectRepository(Expense)
    private readonly expenses: Repository<Expense>,
    @InjectRepository(Share)
    private readonly shares: Repository<Share>,
    @InjectRepository(Settlement)
    private readonly settlements: Repository<Settlement>,
    private readonly groupsService: GroupsService,
  ) {}

  async compute(groupId: string, user: PublicUser) {
    if (!this.groupsService.isPlatformAdmin(user)) {
      await this.groupsService.assertMember(groupId, user.id);
    }

    const group = await this.groups.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');

    const memberRows = await this.members.find({
      where: { groupId },
      relations: ['user'],
    });
    const memberIds = memberRows.map((m) => m.userId);

    const nets: NetMap = new Map(memberIds.map((id) => [id, 0]));

    const expenses = await this.expenses.find({
      where: { groupId, deletedAt: IsNull() },
    });
    const expenseIds = expenses.map((e) => e.id);
    const shareRows =
      expenseIds.length > 0
        ? await this.shares.find({ where: { expenseId: In(expenseIds) } })
        : [];

    for (const expense of expenses) {
      this.addCents(nets, expense.payerUserId, expense.amountCents);
      for (const share of shareRows.filter((s) => s.expenseId === expense.id)) {
        this.addCents(nets, share.userId, -share.amountCents);
      }
    }

    const settlementRows = await this.settlements.find({ where: { groupId } });
    for (const s of settlementRows) {
      this.addCents(nets, s.payerUserId, -s.amountCents);
      this.addCents(nets, s.payeeUserId, s.amountCents);
    }

    const members = memberRows.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      netCents: nets.get(m.userId) ?? 0,
    }));

    const debts = this.simplifyDebts(members);

    return {
      groupId,
      currency: group.currency,
      members,
      debts,
      allClear: debts.length === 0,
    };
  }

  /** Max the debtor can pay the creditor without reversing nets. */
  outstandingBetween(
    members: { userId: string; netCents: number }[],
    payerUserId: string,
    payeeUserId: string,
  ) {
    const payer = members.find((m) => m.userId === payerUserId);
    const payee = members.find((m) => m.userId === payeeUserId);
    if (!payer || !payee) return 0;
    if (payer.netCents >= 0 || payee.netCents <= 0) return 0;
    return Math.min(-payer.netCents, payee.netCents);
  }

  private addCents(nets: NetMap, userId: string, delta: number) {
    nets.set(userId, (nets.get(userId) ?? 0) + delta);
  }

  /** Greedy simplify: debtors pay creditors. */
  private simplifyDebts(members: { userId: string; name: string; netCents: number }[]) {
    type Person = { userId: string; name: string; net: number };
    const creditors: Person[] = members
      .filter((m) => m.netCents > 0)
      .map((m) => ({ userId: m.userId, name: m.name, net: m.netCents }))
      .sort((a, b) => b.net - a.net);
    const debtors: Person[] = members
      .filter((m) => m.netCents < 0)
      .map((m) => ({ userId: m.userId, name: m.name, net: -m.netCents }))
      .sort((a, b) => b.net - a.net);

    const debts: {
      fromUserId: string;
      fromName: string;
      toUserId: string;
      toName: string;
      amountCents: number;
    }[] = [];

    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]!;
      const creditor = creditors[j]!;
      const pay = Math.min(debtor.net, creditor.net);
      if (pay > 0) {
        debts.push({
          fromUserId: debtor.userId,
          fromName: debtor.name,
          toUserId: creditor.userId,
          toName: creditor.name,
          amountCents: pay,
        });
      }
      debtor.net -= pay;
      creditor.net -= pay;
      if (debtor.net === 0) i++;
      if (creditor.net === 0) j++;
    }

    return debts;
  }
}
