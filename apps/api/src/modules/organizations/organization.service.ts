import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { OrganizationRepository } from '../../database/repositories/organization.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { RoleRepository } from '../../database/repositories/role.repository';
import { RoleName } from '../../database/entities/role.entity';
import { MailService } from '../mail/mail.service';
import { OnboardOrganizationDto } from './dto/onboard-organization.dto';
import { GetOrganizationsQueryDto } from './dto/get-organizations-query.dto';
import { ORGANIZATION_ERRORS } from './constants/organization.constants';
import { generateSlug } from '../../common/utils/slug.util';
import { generateTempPassword } from '../../common/utils/password.util';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private readonly orgRepository: OrganizationRepository,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly mailService: MailService,
  ) {}

  async findAllOrganizations(query: GetOrganizationsQueryDto) {
    const result = await this.orgRepository.findPaginated(query);

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  async onboardOrganization(dto: OnboardOrganizationDto, createdByUserId?: string) {
    const slug = generateSlug(dto.name);

    // 1. Check duplicate primaryDomain
    const existingOrgByDomain = await this.orgRepository.findByPrimaryDomain(
      dto.primaryDomain,
    );
    if (existingOrgByDomain) {
      throw new Error(ORGANIZATION_ERRORS.DOMAIN_ALREADY_EXISTS);
    }

    // 2. Check duplicate slug
    const existingOrgBySlug = await this.orgRepository.findBySlug(slug);
    if (existingOrgBySlug) {
      throw new Error(ORGANIZATION_ERRORS.SLUG_ALREADY_EXISTS);
    }

    // 3. Find ORG_ADMIN Role
    const orgAdminRole = await this.roleRepository.findByName(RoleName.ORG_ADMIN);
    if (!orgAdminRole) {
      throw new Error(ORGANIZATION_ERRORS.ORG_ADMIN_ROLE_NOT_FOUND);
    }

    // 4. Save Organization
    const newOrg = await this.orgRepository.createAndSave({
      name: dto.name,
      slug,
      primaryDomain: dto.primaryDomain,
      email: dto.email,
      phone: dto.phone,
      industry: dto.industry,
      logoUrl: dto.logoUrl,
      website: dto.website,
      address: dto.address,
      timezone: dto.timezone || 'Asia/Kolkata',
      createdBy: createdByUserId,
    });

    // 5. Check if user already exists within this newly created organization
    const existingAdminUser = await this.userRepository.findByEmailAndOrganization(
      dto.adminEmail,
      newOrg.id,
    );
    if (existingAdminUser) {
      throw new Error(ORGANIZATION_ERRORS.ADMIN_EMAIL_ALREADY_EXISTS);
    }

    // 6. Generate Temp Password & Hash
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // 7. Create Org Admin User scoped to newOrg.id
    const adminUser = await this.userRepository.createAndSave({
      organizationId: newOrg.id,
      roleId: orgAdminRole.id,
      firstName: dto.adminFirstName,
      lastName: dto.adminLastName,
      email: dto.adminEmail.toLowerCase(),
      passwordHash,
      phone: dto.adminPhone,
      isPasswordChangeRequired: true,
      createdBy: createdByUserId,
    });

    // 8. Update organization ownerId
    await this.orgRepository.updateOrg(newOrg.id, { ownerId: adminUser.id });
    newOrg.ownerId = adminUser.id;

    // 9. Send invitation email using Handlebars template
    await this.mailService.sendOrgAdminInvitationMail({
      toEmail: adminUser.email,
      adminName: `${adminUser.firstName} ${adminUser.lastName}`,
      organizationName: newOrg.name,
      tempPassword,
    });

    this.logger.log(
      `Onboarded organization '${newOrg.name}' (${newOrg.id}) with Admin '${adminUser.email}'`,
    );

    return {
      organization: {
        id: newOrg.id,
        name: newOrg.name,
        slug: newOrg.slug,
        primaryDomain: newOrg.primaryDomain,
        email: newOrg.email,
        phone: newOrg.phone,
        industry: newOrg.industry,
        logoUrl: newOrg.logoUrl,
        website: newOrg.website,
        address: newOrg.address,
        timezone: newOrg.timezone,
        status: newOrg.status,
        ownerId: newOrg.ownerId,
        createdAt: Number(newOrg.createdAt),
      },
      adminUser: {
        id: adminUser.id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        role: orgAdminRole.name,
        isPasswordChangeRequired: adminUser.isPasswordChangeRequired,
      },
    };
  }
}
