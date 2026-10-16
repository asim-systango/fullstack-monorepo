import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { Roles } from '../../common/auth';
import { MailerService } from '../mailer';
import { ONBOARDING_EMAIL_UNAVAILABLE } from '../mailer/onboarding-mail.constants';
import { MembersService } from '../members/members.service';
import { MemberStatus } from '../members/enums/member-status.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { generateTemporaryPassword } from './temporary-password';
import { UsersService } from './users.service';
import { User, type UserRole } from './user.entity';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

@ApiTags('users')
@ApiCookieAuth('access_token')
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly membersService: MembersService,
    private readonly mailer: MailerService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Admin creates a member',
    description:
      'Creates role=user with an active member_profile, emails a temporary password, and requires a password change on first login. Never returns the password.',
  })
  async create(@Body() dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Unable to create account with those details');
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    let user;
    try {
      user = await this.usersService.create({
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: 'user',
        emailVerifiedAt: new Date(),
        mustChangePassword: true,
      });
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Unable to create account with those details');
      }
      throw err;
    }

    try {
      await this.membersService.provision({
        userId: user.id,
        email: user.email,
        fullName: user.name,
      });
    } catch {
      await this.usersService.rollbackCreatedUser(user.id);
      throw new ServiceUnavailableException(
        'Registration is temporarily unavailable. Please try again.',
      );
    }

    try {
      await this.mailer.sendOnboardingEmail({
        to: user.email,
        kind: 'welcome_member',
        temporaryPassword,
      });
    } catch (err) {
      await this.membersService.deleteByUserId(user.id);
      await this.usersService.rollbackCreatedUser(user.id);
      if (err instanceof ServiceUnavailableException) throw err;
      throw new ServiceUnavailableException(ONBOARDING_EMAIL_UNAVAILABLE);
    }

    return this.usersService.toPublic(user);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Promote or demote a user' })
  async updateRole(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'admin' && dto.role !== 'admin') {
      const adminCount = await this.usersService.countByRole('admin');
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot demote the last admin');
      }
    }

    const previousRole = user.role;

    if (dto.role === 'staff' && previousRole === 'user') {
      return this.promoteMemberToStaff(id, user);
    }

    const updated = await this.usersService.updateRole(id, dto.role as UserRole);

    if (dto.role === 'user' && previousRole !== 'user') {
      try {
        await this.membersService.provision({
          userId: updated.id,
          email: updated.email,
          fullName: updated.name,
        });
      } catch {
        await this.usersService.updateRole(id, previousRole);
        throw new ServiceUnavailableException(
          'Role update is temporarily unavailable. Please try again.',
        );
      }
    }

    return this.usersService.toPublic(updated);
  }

  private async promoteMemberToStaff(id: string, user: User) {
    const profile = await this.membersService.findByUserId(id);
    if (profile?.status === MemberStatus.Suspended) {
      throw new BadRequestException('Reinstate this member before promoting to staff');
    }

    const temporaryPassword = generateTemporaryPassword();
    try {
      await this.mailer.sendOnboardingEmail({
        to: user.email,
        kind: 'staff_upgrade',
        temporaryPassword,
      });
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      throw new ServiceUnavailableException(ONBOARDING_EMAIL_UNAVAILABLE);
    }

    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    const updated = await this.usersService.promoteToStaff(id, passwordHash);
    return this.usersService.toPublic(updated);
  }
}
