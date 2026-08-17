import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, QueryFailedError, Repository } from 'typeorm';
import { loadApiEnv } from '../../common/env';
import { generateRawToken, hashToken } from '../auth/token.util';
import { Expense } from '../expenses/expense.entity';
import { Share } from '../expenses/share.entity';
import { MailService } from '../mail';
import { Settlement } from '../settlements/settlement.entity';
import type { PublicUser } from '../users';
import { UsersService } from '../users';
import { GroupInvitation } from './group-invitation.entity';
import { GroupMember } from './group-member.entity';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

export type GroupListFilters = {
  page?: number;
  limit?: number;
  q?: string;
  status?:
    | 'all'
    | 'outstanding'
    | 'settled'
    | 'blocked'
    | 'owed_to_me'
    | 'i_owe'
    | 'admin'
    | 'member';
  sortBy?: 'updatedAt' | 'name' | 'balance';
  sortDir?: 'ASC' | 'DESC';
};

type GroupListRow = {
  group: Group;
  role: GroupMember['role'] | null;
};

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groups: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly members: Repository<GroupMember>,
    @InjectRepository(GroupInvitation)
    private readonly invitations: Repository<GroupInvitation>,
    @InjectRepository(Expense)
    private readonly expenses: Repository<Expense>,
    @InjectRepository(Share)
    private readonly shares: Repository<Share>,
    @InjectRepository(Settlement)
    private readonly settlements: Repository<Settlement>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  isPlatformAdmin(user: PublicUser) {
    return user.role === 'admin';
  }

  async requireGroup(groupId: string) {
    const group = await this.groups.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async assertMember(groupId: string, userId: string) {
    const member = await this.members.findOne({ where: { groupId, userId } });
    if (!member) throw new ForbiddenException('Not a member of this group');
    return member;
  }

  async assertReadable(groupId: string, user: PublicUser) {
    await this.requireGroup(groupId);
    if (!this.isPlatformAdmin(user)) {
      await this.assertMember(groupId, user.id);
    }
  }

  /** Mutations other than platform block/unblock: member + group not blocked. */
  async assertWritable(groupId: string, user: PublicUser) {
    const group = await this.requireGroup(groupId);
    if (group.blockedAt) {
      throw new ForbiddenException('This group has been blocked');
    }
    await this.assertMember(groupId, user.id);
    return group;
  }

  async assertInGroupAdmin(groupId: string, user: PublicUser) {
    const member = await this.assertMember(groupId, user.id);
    if (member.role !== 'admin') {
      throw new ForbiddenException('Group admin access required');
    }
    return member;
  }

  async getMemberUserIds(groupId: string) {
    const rows = await this.members.find({ where: { groupId } });
    return new Set(rows.map((m) => m.userId));
  }

  async create(dto: CreateGroupDto, user: PublicUser) {
    const group = await this.groups.save(
      this.groups.create({
        name: dto.name.trim(),
        currency: dto.currency.toUpperCase(),
        createdByUserId: user.id,
      }),
    );

    await this.members.save(
      this.members.create({
        groupId: group.id,
        userId: user.id,
        role: 'admin',
      }),
    );

    return this.toSummary(group, 'admin', { memberCount: 1, myNetCents: 0 });
  }

  async findAll(user: PublicUser, filters: GroupListFilters = {}) {
    const limit = Math.min(Math.max(filters.limit ?? 10, 1), 50);
    const page = Math.max(filters.page ?? 1, 1);
    const status = filters.status ?? 'all';
    const sortBy = filters.sortBy ?? 'updatedAt';
    const sortDir = filters.sortDir === 'ASC' ? 1 : -1;
    const q = filters.q?.trim().toLowerCase() ?? '';

    const rows = await this.loadListRows(user);
    const allIds = rows.map((row) => row.group.id);
    const allNets = await this.myNetByGroupIds(allIds, user.id);

    let youAreOwedCents = 0;
    let youOweCents = 0;
    let activeGroups = 0;
    for (const row of rows) {
      if (row.group.blockedAt != null) continue;
      const net = allNets.get(row.group.id) ?? 0;
      if (net > 0) youAreOwedCents += net;
      if (net < 0) youOweCents += -net;
      if (net !== 0) activeGroups += 1;
    }

    const stats = {
      totalGroups: rows.length,
      activeGroups,
      youAreOwedCents,
      youOweCents,
    };

    let filtered = q
      ? rows.filter((row) => row.group.name.toLowerCase().includes(q))
      : rows;

    filtered = filtered.filter((row) => {
      const net = allNets.get(row.group.id) ?? 0;
      const blocked = row.group.blockedAt != null;
      switch (status) {
        case 'blocked':
          return blocked;
        case 'outstanding':
          return !blocked && net !== 0;
        case 'settled':
          return !blocked && net === 0;
        case 'owed_to_me':
          return !blocked && net > 0;
        case 'i_owe':
          return !blocked && net < 0;
        case 'admin':
          return row.role === 'admin';
        case 'member':
          return row.role === 'member';
        default:
          return true;
      }
    });

    const groupIds = filtered.map((row) => row.group.id);
    const memberCounts = await this.memberCountsByGroupIds(groupIds);

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.group.name.localeCompare(b.group.name) * sortDir;
      }
      if (sortBy === 'balance') {
        const aNet = Math.abs(allNets.get(a.group.id) ?? 0);
        const bNet = Math.abs(allNets.get(b.group.id) ?? 0);
        if (aNet !== bNet) return (aNet - bNet) * sortDir;
        return b.group.updatedAt.getTime() - a.group.updatedAt.getTime();
      }
      const byUpdated =
        (a.group.updatedAt.getTime() - b.group.updatedAt.getTime()) * sortDir;
      if (byUpdated !== 0) return byUpdated;
      return a.group.name.localeCompare(b.group.name);
    });

    const total = filtered.length;
    const slice = filtered.slice((page - 1) * limit, page * limit);
    const previewByGroup = await this.memberPreviewsByGroupIds(
      slice.map((row) => row.group.id),
    );
    const items = slice.map((row) =>
      this.toSummary(row.group, row.role, {
        memberCount: memberCounts.get(row.group.id) ?? 0,
        myNetCents: allNets.get(row.group.id) ?? 0,
        memberPreviews: previewByGroup.get(row.group.id) ?? [],
      }),
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats,
    };
  }

  async findAccessibleGroups(user: PublicUser) {
    const rows = await this.loadListRows(user);
    return rows
      .map((row) => ({
        id: row.group.id,
        name: row.group.name,
        currency: row.group.currency,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private async loadListRows(user: PublicUser): Promise<GroupListRow[]> {
    if (this.isPlatformAdmin(user)) {
      const all = await this.groups.find({ order: { updatedAt: 'DESC' } });
      if (all.length === 0) return [];
      const memberships = await this.members.find({
        where: { userId: user.id, groupId: In(all.map((g) => g.id)) },
      });
      const roleByGroup = new Map(memberships.map((m) => [m.groupId, m.role]));
      return all.map((group) => ({
        group,
        role: roleByGroup.get(group.id) ?? null,
      }));
    }

    const memberships = await this.members.find({
      where: { userId: user.id },
      relations: ['group'],
      order: { joinedAt: 'DESC' },
    });

    return memberships.map((m) => ({ group: m.group, role: m.role }));
  }

  private async memberCountsByGroupIds(groupIds: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>(groupIds.map((id) => [id, 0]));
    if (groupIds.length === 0) return counts;

    const rows = await this.members
      .createQueryBuilder('m')
      .select('m.groupId', 'groupId')
      .addSelect('COUNT(*)', 'count')
      .where('m.groupId IN (:...groupIds)', { groupIds })
      .groupBy('m.groupId')
      .getRawMany<{ groupId: string; count: string }>();

    for (const row of rows) {
      counts.set(row.groupId, Number(row.count));
    }
    return counts;
  }

  private async memberPreviewsByGroupIds(
    groupIds: string[],
  ): Promise<Map<string, { name: string }[]>> {
    const result = new Map<string, { name: string }[]>(groupIds.map((id) => [id, []]));
    if (groupIds.length === 0) return result;

    const rows = await this.members.find({
      where: { groupId: In(groupIds) },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });

    for (const row of rows) {
      const list = result.get(row.groupId);
      if (!list || list.length >= 4 || !row.user) continue;
      list.push({ name: row.user.name });
    }
    return result;
  }

  /**
   * Batch personal net for a user across groups.
   * Positive = owed to user; negative = user owes.
   */
  private async myNetByGroupIds(
    groupIds: string[],
    userId: string,
  ): Promise<Map<string, number>> {
    const result = new Map<string, number>(groupIds.map((id) => [id, 0]));
    if (groupIds.length === 0) return result;

    const expenses = await this.expenses.find({
      where: { groupId: In(groupIds), deletedAt: IsNull() },
      select: ['id', 'groupId', 'payerUserId', 'amountCents'],
    });
    const expenseIds = expenses.map((e) => e.id);
    const shareRows =
      expenseIds.length > 0
        ? await this.shares.find({
            where: { expenseId: In(expenseIds) },
            select: ['expenseId', 'userId', 'amountCents'],
          })
        : [];
    const sharesByExpense = new Map<string, { userId: string; amountCents: number }[]>();
    for (const share of shareRows) {
      const list = sharesByExpense.get(share.expenseId) ?? [];
      list.push({ userId: share.userId, amountCents: share.amountCents });
      sharesByExpense.set(share.expenseId, list);
    }

    for (const expense of expenses) {
      let next = result.get(expense.groupId) ?? 0;
      if (expense.payerUserId === userId) next += expense.amountCents;
      for (const share of sharesByExpense.get(expense.id) ?? []) {
        if (share.userId === userId) next -= share.amountCents;
      }
      result.set(expense.groupId, next);
    }

    const settlements = await this.settlements.find({
      where: { groupId: In(groupIds) },
      select: ['groupId', 'payerUserId', 'payeeUserId', 'amountCents'],
    });
    for (const s of settlements) {
      let next = result.get(s.groupId) ?? 0;
      if (s.payerUserId === userId) next -= s.amountCents;
      if (s.payeeUserId === userId) next += s.amountCents;
      result.set(s.groupId, next);
    }

    return result;
  }

  async findOne(groupId: string, user: PublicUser) {
    const group = await this.requireGroup(groupId);

    if (!this.isPlatformAdmin(user)) {
      await this.assertMember(groupId, user.id);
    }

    const members = await this.members.find({
      where: { groupId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });

    const myMembership = members.find((m) => m.userId === user.id);
    const nets = await this.myNetByGroupIds([groupId], user.id);

    return {
      id: group.id,
      name: group.name,
      currency: group.currency,
      blocked: group.blockedAt != null,
      myRole: myMembership?.role ?? null,
      updatedAt: group.updatedAt.toISOString(),
      memberCount: members.length,
      myNetCents: nets.get(groupId) ?? 0,
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
      })),
      createdAt: group.createdAt.toISOString(),
    };
  }

  async removeMember(groupId: string, targetUserId: string, user: PublicUser) {
    await this.assertWritable(groupId, user);
    await this.assertInGroupAdmin(groupId, user);

    if (targetUserId === user.id) {
      throw new BadRequestException('Cannot remove yourself');
    }

    const target = await this.members.findOne({
      where: { groupId, userId: targetUserId },
    });
    if (!target) throw new NotFoundException('Member not found');

    if (target.role === 'admin') {
      const adminCount = await this.members.count({
        where: { groupId, role: 'admin' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot remove the last group admin');
      }
    }

    await this.members.remove(target);
    return { message: 'Member removed' };
  }

  async blockGroup(groupId: string, user: PublicUser) {
    const group = await this.requireGroup(groupId);
    group.blockedAt = new Date();
    group.blockedByUserId = user.id;
    await this.groups.save(group);
    return this.toSummaryForUser(group, user.id);
  }

  async unblockGroup(groupId: string, user: PublicUser) {
    const group = await this.requireGroup(groupId);
    group.blockedAt = null;
    group.blockedByUserId = null;
    await this.groups.save(group);
    return this.toSummaryForUser(group, user.id);
  }

  async sendInvite(groupId: string, emailRaw: string, user: PublicUser) {
    const group = await this.assertWritable(groupId, user);

    const email = emailRaw.trim().toLowerCase();
    if (email === user.email.toLowerCase()) {
      throw new BadRequestException('You are already a member of this group');
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      const alreadyMember = await this.members.findOne({
        where: { groupId, userId: existingUser.id },
      });
      if (alreadyMember) {
        throw new ConflictException('User is already a member');
      }
    }

    const pending = await this.invitations.findOne({
      where: { groupId, inviteeEmail: email, status: 'pending' },
    });
    if (pending) {
      throw new ConflictException('An invite is already pending for this email');
    }

    const rawToken = generateRawToken();
    const days = loadApiEnv().GROUP_INVITE_EXPIRES_DAYS;
    const invite = this.invitations.create({
      groupId,
      invitedByUserId: user.id,
      inviteeEmail: email,
      inviteeUserId: existingUser?.id ?? null,
      inviteTokenHash: hashToken(rawToken),
      status: 'pending',
      expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      respondedAt: null,
    });

    try {
      await this.invitations.save(invite);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('An invite is already pending for this email');
      }
      throw err;
    }

    await this.mailService.sendGroupInviteEmail(email, rawToken, group.name, user.name);
    return this.toInviteDto(invite, group.name);
  }

  async listGroupInvites(groupId: string, user: PublicUser) {
    await this.assertReadable(groupId, user);

    const rows = await this.invitations.find({
      where: { groupId, status: 'pending' },
      order: { createdAt: 'DESC' },
    });
    const group = await this.requireGroup(groupId);
    const live: typeof rows = [];
    for (const row of rows) {
      if (await this.expireIfNeeded(row)) continue;
      live.push(row);
    }
    return live.map((row) => this.toInviteDto(row, group.name));
  }

  async listMyInvites(user: PublicUser) {
    const rows = await this.invitations.find({
      where: [
        { inviteeEmail: user.email.toLowerCase(), status: 'pending' },
        { inviteeUserId: user.id, status: 'pending' },
      ],
      relations: ['group'],
      order: { createdAt: 'DESC' },
    });

    const seen = new Set<string>();
    const live: typeof rows = [];
    for (const row of rows) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      if (await this.expireIfNeeded(row)) continue;
      live.push(row);
    }
    return live.map((row) => this.toInviteDto(row, row.group.name));
  }

  async previewInvite(token: string) {
    if (!token.trim()) throw new BadRequestException('Missing invite token');
    const invite = await this.invitations.findOne({
      where: { inviteTokenHash: hashToken(token.trim()) },
      relations: ['group'],
    });
    if (!invite) throw new BadRequestException('Invalid or expired invite');
    await this.expireIfNeeded(invite);

    const existingUser = await this.usersService.findByEmail(invite.inviteeEmail);
    return {
      groupId: invite.groupId,
      groupName: invite.group.name,
      inviteeEmail: invite.inviteeEmail,
      hasAccount: Boolean(existingUser),
      status: invite.status,
    };
  }

  async acceptByToken(token: string, user: PublicUser) {
    const invite = await this.invitations.findOne({
      where: { inviteTokenHash: hashToken(token.trim()) },
      relations: ['group'],
    });
    if (!invite) throw new BadRequestException('Invalid or expired token');
    return this.acceptInvite(invite, user);
  }

  async acceptById(inviteId: string, user: PublicUser) {
    const invite = await this.invitations.findOne({
      where: { id: inviteId },
      relations: ['group'],
    });
    if (!invite) throw new NotFoundException('Invite not found');
    return this.acceptInvite(invite, user);
  }

  async declineById(inviteId: string, user: PublicUser) {
    const invite = await this.invitations.findOne({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('Invite not found');
    this.assertInvitee(invite, user);
    if (invite.status !== 'pending') {
      throw new BadRequestException('Invite is no longer pending');
    }
    if (await this.expireIfNeeded(invite)) {
      throw new BadRequestException('Invalid or expired token');
    }
    invite.status = 'declined';
    invite.respondedAt = new Date();
    invite.inviteeUserId = user.id;
    await this.invitations.save(invite);
    return { message: 'Invite declined' };
  }

  private async acceptInvite(invite: GroupInvitation, user: PublicUser) {
    this.assertInvitee(invite, user);
    if (invite.status !== 'pending') {
      throw new BadRequestException('Invite is no longer pending');
    }
    if (await this.expireIfNeeded(invite)) {
      throw new BadRequestException('Invalid or expired token');
    }

    const existing = await this.members.findOne({
      where: { groupId: invite.groupId, userId: user.id },
    });
    if (!existing) {
      await this.members.save(
        this.members.create({
          groupId: invite.groupId,
          userId: user.id,
          role: 'member',
        }),
      );
    }

    invite.status = 'accepted';
    invite.respondedAt = new Date();
    invite.inviteeUserId = user.id;
    await this.invitations.save(invite);

    return this.findOne(invite.groupId, user);
  }

  private assertInvitee(invite: GroupInvitation, user: PublicUser) {
    const emailMatch = invite.inviteeEmail.toLowerCase() === user.email.toLowerCase();
    const userMatch = invite.inviteeUserId != null && invite.inviteeUserId === user.id;
    if (!emailMatch && !userMatch) {
      throw new ForbiddenException('This invite is for a different account');
    }
  }

  private async expireIfNeeded(invite: GroupInvitation) {
    if (invite.status === 'pending' && invite.expiresAt.getTime() < Date.now()) {
      invite.status = 'expired';
      await this.invitations.save(invite);
      return true;
    }
    return false;
  }

  private toInviteDto(invite: GroupInvitation, groupName: string) {
    return {
      id: invite.id,
      groupId: invite.groupId,
      groupName,
      inviteeEmail: invite.inviteeEmail,
      status: invite.status,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString(),
    };
  }

  /**
   * People you share groups with (“friends”), paginated + searchable.
   * `view=groups` pages by group; `view=people` pages unique people.
   */
  async listFriends(
    user: PublicUser,
    opts: {
      page?: number;
      limit?: number;
      q?: string;
      groupId?: string;
      view?: 'groups' | 'people';
    } = {},
  ) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(50, Math.max(1, opts.limit ?? 10));
    const q = opts.q?.trim().toLowerCase() ?? '';
    const view = opts.view === 'people' ? 'people' : 'groups';

    const myRows = await this.loadListRows(user);
    let groupIds = myRows.map((r) => r.group.id);
    if (opts.groupId) {
      if (!groupIds.includes(opts.groupId) && !this.isPlatformAdmin(user)) {
        throw new ForbiddenException('Not a member of this group');
      }
      if (this.isPlatformAdmin(user) && !groupIds.includes(opts.groupId)) {
        await this.requireGroup(opts.groupId);
        groupIds = [opts.groupId];
      } else {
        groupIds = groupIds.filter((id) => id === opts.groupId);
      }
    }

    const emptyStats = { uniqueFriends: 0, sharedGroups: 0 };
    if (groupIds.length === 0) {
      return {
        view,
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
        stats: emptyStats,
        groupOptions: [] as { id: string; name: string }[],
      };
    }

    const groupOptions = myRows
      .map((r) => ({ id: r.group.id, name: r.group.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const memberships = await this.members.find({
      where: { groupId: In(groupIds) },
      relations: ['user', 'group'],
      order: { joinedAt: 'ASC' },
    });

    type FriendMembership = {
      userId: string;
      name: string;
      email: string;
      role: GroupMember['role'];
      joinedAt: string;
      groupId: string;
      groupName: string;
      groupCurrency: string;
    };

    const others: FriendMembership[] = [];
    for (const m of memberships) {
      if (m.userId === user.id) continue;
      if (!m.user || !m.group) continue;
      others.push({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
        groupId: m.groupId,
        groupName: m.group.name,
        groupCurrency: m.group.currency,
      });
    }

    const uniqueIds = new Set(others.map((o) => o.userId));
    const sharedGroupIds = new Set(others.map((o) => o.groupId));
    const stats = {
      uniqueFriends: uniqueIds.size,
      sharedGroups: sharedGroupIds.size,
    };

    const matchesQuery = (name: string, email: string, groupName?: string) => {
      if (!q) return true;
      return (
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        (groupName ? groupName.toLowerCase().includes(q) : false)
      );
    };

    if (view === 'people') {
      const byUser = new Map<
        string,
        {
          userId: string;
          name: string;
          email: string;
          groups: { id: string; name: string; role: GroupMember['role'] }[];
        }
      >();

      for (const row of others) {
        if (!matchesQuery(row.name, row.email, row.groupName)) continue;
        const existing = byUser.get(row.userId);
        if (existing) {
          if (!existing.groups.some((g) => g.id === row.groupId)) {
            existing.groups.push({
              id: row.groupId,
              name: row.groupName,
              role: row.role,
            });
          }
        } else {
          byUser.set(row.userId, {
            userId: row.userId,
            name: row.name,
            email: row.email,
            groups: [{ id: row.groupId, name: row.groupName, role: row.role }],
          });
        }
      }

      const people = [...byUser.values()].sort((a, b) => a.name.localeCompare(b.name));
      const total = people.length;
      const slice = people.slice((page - 1) * limit, page * limit);

      return {
        view,
        items: slice,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        stats,
        groupOptions,
      };
    }

    const byGroup = new Map<
      string,
      {
        group: { id: string; name: string; currency: string };
        allMembers: {
          userId: string;
          name: string;
          email: string;
          role: GroupMember['role'];
          joinedAt: string;
        }[];
      }
    >();

    for (const row of myRows) {
      if (!groupIds.includes(row.group.id)) continue;
      byGroup.set(row.group.id, {
        group: {
          id: row.group.id,
          name: row.group.name,
          currency: row.group.currency,
        },
        allMembers: [],
      });
    }
    if (opts.groupId && this.isPlatformAdmin(user) && !byGroup.has(opts.groupId)) {
      const g = await this.requireGroup(opts.groupId);
      byGroup.set(g.id, {
        group: { id: g.id, name: g.name, currency: g.currency },
        allMembers: [],
      });
    }

    for (const row of others) {
      const section = byGroup.get(row.groupId);
      if (!section) continue;
      section.allMembers.push({
        userId: row.userId,
        name: row.name,
        email: row.email,
        role: row.role,
        joinedAt: row.joinedAt,
      });
    }

    const sections = [...byGroup.values()]
      .map((s) => {
        const groupMatches = q ? s.group.name.toLowerCase().includes(q) : true;
        const members = s.allMembers
          .filter((m) => {
            if (!q || groupMatches) return true;
            return matchesQuery(m.name, m.email);
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        const include =
          members.length > 0 || (Boolean(q) && groupMatches && s.allMembers.length === 0);

        return {
          group: s.group,
          members,
          memberCount: members.length,
          include,
        };
      })
      .filter((s) => s.include)
      .map(({ include: _include, ...rest }) => rest)
      .sort((a, b) => a.group.name.localeCompare(b.group.name));

    const total = sections.length;
    const slice = sections.slice((page - 1) * limit, page * limit);

    return {
      view,
      items: slice,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats,
      groupOptions,
    };
  }

  private async toSummaryForUser(group: Group, userId: string) {
    const membership = await this.members.findOne({
      where: { groupId: group.id, userId },
    });
    const [nets, counts] = await Promise.all([
      this.myNetByGroupIds([group.id], userId),
      this.memberCountsByGroupIds([group.id]),
    ]);
    return this.toSummary(group, membership?.role ?? null, {
      memberCount: counts.get(group.id) ?? 0,
      myNetCents: nets.get(group.id) ?? 0,
    });
  }

  private toSummary(
    group: Group,
    role: GroupMember['role'] | null,
    extras: {
      memberCount: number;
      myNetCents: number;
      memberPreviews?: { name: string }[];
    },
  ) {
    return {
      id: group.id,
      name: group.name,
      currency: group.currency,
      blocked: group.blockedAt != null,
      myRole: role,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
      memberCount: extras.memberCount,
      myNetCents: extras.myNetCents,
      memberPreviews: extras.memberPreviews ?? [],
    };
  }
}
