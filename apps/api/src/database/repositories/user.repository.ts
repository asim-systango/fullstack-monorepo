import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';
import { RoleName } from '../entities/role.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  getRepo(): Repository<User> {
    return this.userRepo;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: ['role', 'organization'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email: email.toLowerCase() },
      relations: ['role', 'organization'],
    });
  }

  async findByEmailAndOrganization(
    email: string,
    organizationId: string | null,
  ): Promise<User | null> {
    return this.userRepo.findOne({
      where: {
        email: email.toLowerCase(),
        organizationId: organizationId === null ? IsNull() : organizationId,
      },
      relations: ['role', 'organization'],
    });
  }

  async findByEmailAndOrgSlug(email: string, slug: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: {
        email: email.toLowerCase(),
        organization: { slug },
      },
      relations: ['role', 'organization'],
    });
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    return this.userRepo.find({
      where: { organizationId },
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRoleName(roleName: RoleName): Promise<User[]> {
    return this.userRepo
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.role', 'role')
      .leftJoinAndSelect('u.organization', 'organization')
      .where('role.name = :roleName', { roleName })
      .getMany();
  }

  async findSuperAdminEmails(): Promise<string[]> {
    const users = await this.userRepo
      .createQueryBuilder('u')
      .innerJoin('u.role', 'role')
      .where('role.name = :roleName', { roleName: RoleName.SUPER_ADMIN })
      .getMany();

    const emailSet = new Set<string>();

    for (const u of users) {
      if (u.email) {
        emailSet.add(u.email.toLowerCase().trim());
      }
    }

    if (process.env.SUPER_ADMIN_EMAIL) {
      emailSet.add(process.env.SUPER_ADMIN_EMAIL.toLowerCase().trim());
    }

    return Array.from(emailSet);
  }

  async getKpis(): Promise<{ totalPlatformUsers: number; pendingInvites: number }> {
    const totalPlatformUsers = await this.userRepo.count();
    const pendingInvites = await this.userRepo.count({
      where: { isPasswordChangeRequired: true },
    });
    return { totalPlatformUsers, pendingInvites };
  }

  async createAndSave(data: Partial<User>): Promise<User> {
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
    await this.userRepo.update(id, {
      ...data,
      updatedAt: Date.now(),
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepo.update(id, {
      lastLoginAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async markPasswordChanged(id: string): Promise<void> {
    await this.userRepo.update(id, {
      isPasswordChangeRequired: false,
      updatedAt: Date.now(),
    });
  }
}
