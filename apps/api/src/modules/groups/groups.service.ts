import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PublicUser } from '../users';
import { GroupMember } from './group-member.entity';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groups: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly members: Repository<GroupMember>,
  ) {}

  isPlatformAdmin(user: PublicUser) {
    return user.role === 'admin';
  }

  async assertMember(groupId: string, userId: string) {
    const member = await this.members.findOne({ where: { groupId, userId } });
    if (!member) throw new ForbiddenException('Not a member of this group');
    return member;
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

    return this.toSummary(group, 'admin');
  }

  async findAll(user: PublicUser) {
    if (this.isPlatformAdmin(user)) {
      const all = await this.groups.find({ order: { updatedAt: 'DESC' } });
      return Promise.all(all.map((g) => this.toSummaryForUser(g, user.id)));
    }

    const memberships = await this.members.find({
      where: { userId: user.id },
      relations: ['group'],
      order: { joinedAt: 'DESC' },
    });

    return Promise.all(memberships.map((m) => this.toSummary(m.group, m.role)));
  }

  async findOne(groupId: string, user: PublicUser) {
    const group = await this.groups.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');

    if (!this.isPlatformAdmin(user)) {
      await this.assertMember(groupId, user.id);
    }

    const members = await this.members.find({
      where: { groupId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });

    const myMembership = members.find((m) => m.userId === user.id);

    return {
      id: group.id,
      name: group.name,
      currency: group.currency,
      blocked: group.blockedAt != null,
      myRole: myMembership?.role ?? (this.isPlatformAdmin(user) ? 'admin' : null),
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

  private async toSummaryForUser(group: Group, userId: string) {
    const membership = await this.members.findOne({
      where: { groupId: group.id, userId },
    });
    return this.toSummary(group, membership?.role ?? null);
  }

  private toSummary(group: Group, role: GroupMember['role'] | null) {
    return {
      id: group.id,
      name: group.name,
      currency: group.currency,
      blocked: group.blockedAt != null,
      myRole: role,
      createdAt: group.createdAt.toISOString(),
    };
  }
}
