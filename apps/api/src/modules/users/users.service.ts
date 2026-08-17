import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, type OtpPurpose, type UserRole } from './user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: string) {
    return this.users.findOne({ where: { id } });
  }

  async create(input: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
    emailVerifiedAt?: Date | null;
    mustChangePassword?: boolean;
  }) {
    const user = this.users.create({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      name: input.name,
      role: input.role ?? 'user',
      emailVerifiedAt: input.emailVerifiedAt ?? null,
      mustChangePassword: input.mustChangePassword ?? false,
      otpAttempts: 0,
    });
    return this.users.save(user);
  }

  save(user: User) {
    return this.users.save(user);
  }

  async deleteById(id: string): Promise<void> {
    await this.users.delete({ id });
  }

  async updateProfile(
    id: string,
    input: { email?: string; name?: string },
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (input.email !== undefined) user.email = input.email.toLowerCase();
    if (input.name !== undefined) user.name = input.name;
    return this.users.save(user);
  }

  async updatePasswordHash(
    id: string,
    passwordHash: string,
    mustChangePassword?: boolean,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.passwordHash = passwordHash;
    if (mustChangePassword !== undefined) {
      user.mustChangePassword = mustChangePassword;
    }
    return this.users.save(user);
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.users.update({ id }, { lastLoginAt: new Date() });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    return this.users.save(user);
  }

  async promoteToStaff(id: string, passwordHash: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.role = 'staff';
    user.passwordHash = passwordHash;
    user.mustChangePassword = true;
    return this.users.save(user);
  }

  countByRole(role: UserRole): Promise<number> {
    return this.users.count({ where: { role } });
  }

  /**
   * Compensating delete after failed profile provision.
   * Logs critically if the delete itself fails — do not pretend rollback succeeded.
   */
  async rollbackCreatedUser(userId: string): Promise<void> {
    try {
      await this.deleteById(userId);
    } catch (err) {
      this.logger.error(
        `CRITICAL consistency error: provisioning failed and rollback DELETE failed for userId=${userId}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  toPublic(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerifiedAt != null,
      mustChangePassword: user.mustChangePassword,
    };
  }
}

export type PublicUser = ReturnType<UsersService['toPublic']>;
export type { OtpPurpose };
