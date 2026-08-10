import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, User, type UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  findByPhone(phone: string) {
    return this.users.findOne({ where: { phone } });
  }

  findById(id: string) {
    return this.users.findOne({ where: { id } });
  }

  async create(input: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    role?: UserRole;
  }) {
    const fullName =
      input.name ||
      [input.firstName, input.lastName].filter(Boolean).join(' ') ||
      input.email.split('@')[0];

    const user = this.users.create({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      name: fullName,
      phone: input.phone,
      role: input.role ?? Role.PATIENT,
      isActive: true,
      emailVerified: false,
    });
    return this.users.save(user);
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string | null) {
    await this.users.update(userId, { hashedRefreshToken });
  }

  toPublic(user: User) {
    const firstName =
      user.firstName || user.name?.split(' ')[0] || user.email.split('@')[0];
    const lastName = user.lastName || user.name?.split(' ').slice(1).join(' ') || '';

    return {
      id: user.id,
      email: user.email,
      firstName,
      lastName,
      name: user.name || `${firstName} ${lastName}`.trim(),
      phone: user.phone ?? '',
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export type PublicUser = ReturnType<UsersService['toPublic']>;
