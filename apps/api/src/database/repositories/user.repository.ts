import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';
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

  async findPaginated(query: {
    organizationId?: string | null;
    search?: string;
    roleName?: RoleName;
    status?: string;
    page?: number;
    limit?: number;
    allowedRoleNames?: RoleName[];
    exactUserId?: string;
    excludeUserId?: string;
  }): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      organizationId,
      search,
      roleName,
      status,
      page = 1,
      limit = 10,
      allowedRoleNames,
      exactUserId,
      excludeUserId,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .leftJoinAndSelect('u.organization', 'organization');

    if (exactUserId) {
      qb.andWhere('u.id = :exactUserId', { exactUserId });
    } else {
      if (organizationId !== undefined) {
        if (organizationId === null) {
          qb.andWhere('u.organizationId IS NULL');
        } else {
          qb.andWhere('u.organizationId = :organizationId', { organizationId });
        }
      }

      if (excludeUserId) {
        qb.andWhere('u.id != :excludeUserId', { excludeUserId });
      }

      if (search) {
        const searchTerm = `%${search.trim().toLowerCase()}%`;
        qb.andWhere(
          '(LOWER(u.firstName) LIKE :search OR LOWER(u.lastName) LIKE :search OR LOWER(u.email) LIKE :search)',
          { search: searchTerm },
        );
      }

      if (roleName) {
        qb.andWhere('role.name = :roleName', { roleName });
      }

      if (allowedRoleNames && allowedRoleNames.length > 0) {
        qb.andWhere('role.name IN (:...allowedRoleNames)', { allowedRoleNames });
      }

      if (status) {
        qb.andWhere('u.status = :status', { status });
      }
    }

    qb.orderBy('u.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit) || 1;

    return { data, total, page, limit, totalPages };
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
      status: UserStatus.ACTIVE,
      updatedAt: Date.now(),
    });
  }
}
