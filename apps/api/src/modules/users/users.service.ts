import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, type UserRole } from './user.entity';

@Injectable()
export class UsersService {
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
    passwordHash?: string | null;
    name: string;
    role?: UserRole;
    emailVerifiedAt?: Date | null;
    googleId?: string | null;
  }) {
    const user = this.users.create({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash ?? null,
      name: input.name,
      role: input.role ?? 'user',
      emailVerifiedAt: input.emailVerifiedAt ?? null,
      googleId: input.googleId ?? null,
    });
    return this.users.save(user);
  }

  findByGoogleId(googleId: string) {
    return this.users.findOne({ where: { googleId } });
  }

  async linkGoogleAccount(userId: string, googleId: string) {
    const existing = await this.findById(userId);
    await this.users.update(userId, {
      googleId,
      emailVerifiedAt: existing?.emailVerifiedAt ?? new Date(),
    });
    return this.findById(userId);
  }

  async updatePassword(userId: string, passwordHash: string) {
    await this.users.update(userId, { passwordHash });
  }

  async markEmailVerified(userId: string) {
    await this.users.update(userId, { emailVerifiedAt: new Date() });
    return this.findById(userId);
  }

  toPublic(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerifiedAt != null,
    };
  }
}

export type PublicUser = ReturnType<UsersService['toPublic']>;
