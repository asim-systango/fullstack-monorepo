import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationStatus } from '../entities/organization.entity';
import { User } from '../entities/user.entity';

export interface FormattedOrganizationResult {
  id: string;
  name: string;
  slug: string;
  primaryDomain: string;
  email: string;
  phone: string;
  industry: string;
  logoUrl: string | null;
  website: string | null;
  address: string | null;
  timezone: string;
  status: OrganizationStatus;
  ownerId: string | null;
  usersCount: number;
  adminUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isPasswordChangeRequired: boolean;
  } | null;
  createdAt: number;
  updatedAt: number;
}

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  getRepo(): Repository<Organization> {
    return this.orgRepo;
  }

  async findById(id: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { slug } });
  }

  async findByPrimaryDomain(domain: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { primaryDomain: domain } });
  }

  async findAll(): Promise<Organization[]> {
    return this.orgRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findPaginated(query: {
    search?: string;
    status?: OrganizationStatus;
    page?: number;
    limit?: number;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{
    data: FormattedOrganizationResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, status, page = 1, limit = 10, sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    // 1. Build base query builder with search & status filters
    const qb = this.orgRepo.createQueryBuilder('org');

    if (search) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(org.name) LIKE :search OR LOWER(org.slug) LIKE :search OR LOWER(org.primaryDomain) LIKE :search OR LOWER(org.email) LIKE :search)',
        { search: searchTerm },
      );
    }

    if (status) {
      qb.andWhere('org.status = :status', { status });
    }

    // 2. Get total count of matching organizations directly from qb
    const total = await qb.getCount();

    // 3. Attach joins, selects, sorting, offset, and limit for paginated data
    qb.leftJoin('users', 'adminUser', 'adminUser.id = org.ownerId')
      .select([
        'org.id AS "id"',
        'org.name AS "name"',
        'org.slug AS "slug"',
        'org.primaryDomain AS "primaryDomain"',
        'org.email AS "email"',
        'org.phone AS "phone"',
        'org.industry AS "industry"',
        'org.logoUrl AS "logoUrl"',
        'org.website AS "website"',
        'org.address AS "address"',
        'org.timezone AS "timezone"',
        'org.status AS "status"',
        'org.ownerId AS "ownerId"',
        'org.createdAt AS "createdAt"',
        'org.updatedAt AS "updatedAt"',
        'adminUser.id AS "adminId"',
        'adminUser.firstName AS "adminFirstName"',
        'adminUser.lastName AS "adminLastName"',
        'adminUser.email AS "adminEmail"',
        'adminUser.isPasswordChangeRequired AS "adminIsPasswordChangeRequired"',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(u.id)', 'count')
            .from(User, 'u')
            .where('u.organizationId = org.id'),
        'usersCount',
      )
      .orderBy('org.createdAt', sortOrder)
      .offset(skip)
      .limit(limit);

    const rawResults = await qb.getRawMany();
    const totalPages = Math.ceil(total / limit) || 1;

    const data: FormattedOrganizationResult[] = rawResults.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      primaryDomain: row.primaryDomain,
      email: row.email,
      phone: row.phone,
      industry: row.industry,
      logoUrl: row.logoUrl || null,
      website: row.website || null,
      address: row.address || null,
      timezone: row.timezone,
      status: row.status as OrganizationStatus,
      ownerId: row.ownerId || null,
      usersCount: Number(row.usersCount) || 0,
      adminUser: row.adminId
        ? {
            id: row.adminId,
            firstName: row.adminFirstName,
            lastName: row.adminLastName,
            email: row.adminEmail,
            isPasswordChangeRequired: Boolean(row.adminIsPasswordChangeRequired),
          }
        : null,
      createdAt: Number(row.createdAt),
      updatedAt: Number(row.updatedAt),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createAndSave(data: Partial<Organization>): Promise<Organization> {
    const org = this.orgRepo.create(data);
    return this.orgRepo.save(org);
  }

  async updateOrg(id: string, data: Partial<Organization>): Promise<void> {
    await this.orgRepo.update(id, {
      ...data,
      updatedAt: Date.now(),
    });
  }

  async updateStatus(id: string, status: OrganizationStatus): Promise<void> {
    await this.orgRepo.update(id, {
      status,
      updatedAt: Date.now(),
    });
  }
}
