import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../database/repositories/user.repository';
import { OrganizationRepository } from '../../database/repositories/organization.repository';
import { LoginDto } from './dto/login.dto';
import { AUTH_ERRORS } from './constants/auth.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly orgRepository: OrganizationRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    let user = null;

    // If organization slug is specified (Keka-style URL login), try tenant-scoped lookup first
    if (dto.organizationSlug) {
      user = await this.userRepository.findByEmailAndOrgSlug(
        dto.email,
        dto.organizationSlug,
      );
    }

    // Fallback to global email lookup if tenant-scoped lookup was not specified or did not match
    if (!user) {
      user = await this.userRepository.findByEmail(dto.email);
    }

    if (!user) {
      throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    if (user.status !== 'ACTIVE') {
      throw new Error(AUTH_ERRORS.USER_INACTIVE);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Validate Organization Context & Status
    let organizationContext: {
      id: string;
      name: string;
      slug: string;
      primaryDomain: string;
      logoUrl?: string;
    } | null = null;

    if (user.organizationId) {
      const org = await this.orgRepository.findById(user.organizationId);
      if (!org || org.status !== 'ACTIVE') {
        throw new Error(AUTH_ERRORS.ORGANIZATION_INACTIVE);
      }

      if (dto.organizationSlug && org.slug !== dto.organizationSlug) {
        throw new Error(AUTH_ERRORS.ORGANIZATION_MISMATCH);
      }

      organizationContext = {
        id: org.id,
        name: org.name,
        slug: org.slug,
        primaryDomain: org.primaryDomain,
        logoUrl: org.logoUrl,
      };
    }

    // Update last login timestamp
    await this.userRepository.updateLastLogin(user.id);

    const roleName = user.role?.name || null;

    // Sign JWT Access Token using secret & expiry from env configuration
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: roleName,
    };

    const accessToken = this.jwtService.sign(jwtPayload);

    this.logger.log(`User '${user.email}' (${roleName}) logged in successfully`);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRY || '7d',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: roleName,
        isPasswordChangeRequired: user.isPasswordChangeRequired,
        lastLoginAt: Date.now(),
      },
      organization: organizationContext,
    };
  }
}
