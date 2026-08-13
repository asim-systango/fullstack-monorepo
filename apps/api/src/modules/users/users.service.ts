import { Injectable } from '@nestjs/common';
import { RoleName } from '../../database/entities/role.entity';
import { InviteUserDto } from './dto/invite-user.dto';
import { MailService } from '../mail/mail.service';
import { UserRepository } from '../../database/repositories/user.repository';
import { RoleRepository } from '../../database/repositories/role.repository';
import { OrganizationRepository } from '../../database/repositories/organization.repository';
import { USERS_ERRORS, USERS_MESSAGES } from './constants/users.constants';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { GetUsersDto } from './dto/get-users.dto';
import { UserStatus } from '../../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly orgRepository: OrganizationRepository,
    private readonly mailService: MailService,
  ) {}

  async inviteUser(
    inviterId: string,
    inviterOrgId: string | undefined,
    inviterRole: RoleName,
    dto: InviteUserDto,
  ) {
    if (!inviterOrgId) {
      throw new Error(USERS_ERRORS.NOT_ORGANIZATION_MEMBER);
    }

    const targetRole = dto.roleName;

    const allowedToInvite = this.canInvite(inviterRole, targetRole);
    if (!allowedToInvite) {
      throw new Error(USERS_ERRORS.ROLE_NOT_ALLOWED_TO_INVITE);
    }

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error(USERS_ERRORS.USER_ALREADY_EXISTS);
    }

    const roleEntity = await this.roleRepository.findByName(targetRole);
    if (!roleEntity) {
      throw new Error(USERS_ERRORS.ROLE_NOT_FOUND);
    }

    const org = await this.orgRepository.findById(inviterOrgId);
    if (!org) {
      throw new Error(USERS_ERRORS.ORGANIZATION_NOT_FOUND);
    }

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newUser = await this.userRepository.createAndSave({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      roleId: roleEntity.id,
      organizationId: inviterOrgId,
      createdBy: inviterId,
      status: UserStatus.PENDING,
      isPasswordChangeRequired: true,
    });

    await this.mailService.sendUserInvitationMail({
      toEmail: newUser.email,
      userName: `${newUser.firstName} ${newUser.lastName}`,
      organizationName: org.name,
      tempPassword,
    });

    return {
      message: USERS_MESSAGES.USER_INVITED_SUCCESSFULLY,
      userId: newUser.id,
    };
  }

  async getUsers(
    requesterId: string,
    requesterOrgId: string | undefined,
    requesterRole: RoleName,
    dto: GetUsersDto,
  ) {
    let exactUserId: string | undefined;
    let allowedRoleNames: RoleName[] | undefined;
    let targetOrgId = dto.organizationId;

    if (requesterRole !== RoleName.SUPER_ADMIN) {
      targetOrgId = requesterOrgId;

      if (requesterRole === RoleName.ORG_ADMIN) {
        // ORG_ADMIN can see all users in their org
        allowedRoleNames = [RoleName.ORG_ADMIN, RoleName.SALES_LEAD, RoleName.SALES_REP];
      } else if (requesterRole === RoleName.SALES_LEAD) {
        // SALES_LEAD can see themselves and all SALES_REPs in their org?
        // User said: "sales lead sare sales ref dekh skta h or phir jo sales ref bs apne aap ko dekh skta h"
        allowedRoleNames = [RoleName.SALES_LEAD, RoleName.SALES_REP];
      } else if (requesterRole === RoleName.SALES_REP) {
        // SALES_REP can only see themselves
        exactUserId = requesterId;
      } else {
        // Other roles can't see anyone by default, or maybe just themselves
        exactUserId = requesterId;
      }
    }

    const { data, total, page, limit, totalPages } =
      await this.userRepository.findPaginated({
        organizationId: targetOrgId,
        search: dto.search,
        roleName: dto.roleName,
        status: dto.status,
        page: dto.page,
        limit: dto.limit,
        allowedRoleNames,
        exactUserId,
        excludeUserId: requesterId,
      });

    const mappedData = data.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleName: user.role?.name,
      status: user.status,
      isPasswordChangeRequired: user.isPasswordChangeRequired,
      lastLoginAt: user.lastLoginAt ? Number(user.lastLoginAt) : null,
      createdAt: Number(user.createdAt),
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
    }));

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private canInvite(inviterRole: RoleName, targetRole: RoleName): boolean {
    if (inviterRole === RoleName.ORG_ADMIN) {
      return [RoleName.ORG_ADMIN, RoleName.SALES_LEAD, RoleName.SALES_REP].includes(
        targetRole,
      );
    }
    if (inviterRole === RoleName.SALES_LEAD) {
      return targetRole === RoleName.SALES_REP;
    }
    return false;
  }
}
