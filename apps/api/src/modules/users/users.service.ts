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
