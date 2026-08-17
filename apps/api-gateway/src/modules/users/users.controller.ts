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
import { CreateUserDto, UpdateRoleDto } from '../auth/dto/auth.dto';
import { DomainApiClient } from '../domain-api';
import { UsersService } from './users.service';
import type { UserRole } from './user.entity';

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
    private readonly domainApi: DomainApiClient,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Admin creates a user',
    description:
      'Only route that accepts role. role=user also provisions member_profile.',
  })
  async create(@Body() dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Unable to create account with those details');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    let user;
    try {
      user = await this.usersService.create({
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: dto.role,
        // Admin-created accounts are trusted — skip OTP.
        emailVerifiedAt: new Date(),
      });
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Unable to create account with those details');
      }
      throw err;
    }

    if (dto.role === 'user') {
      try {
        await this.domainApi.provisionMemberProfile({
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
    const updated = await this.usersService.updateRole(id, dto.role as UserRole);

    // Newly demoted/promoted to user needs a library profile.
    if (dto.role === 'user' && previousRole !== 'user') {
      try {
        await this.domainApi.provisionMemberProfile({
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
}
