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

  findAll() {
    return this.users.find({ order: { createdAt: 'DESC' } });
  }

  async listPublic() {
    const users = await this.findAll();
    return users.map((user) => this.toPublic(user));
  }

  countByRole(role: UserRole) {
    return this.users.count({ where: { role } });
  }

  async create(input: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
  }) {
    const user = this.users.create({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      name: input.name,
      role: input.role ?? 'user',
    });
    return this.users.save(user);
  }

  update(user: User, patch: { name?: string; email?: string; isActive?: boolean }) {
    if (patch.name !== undefined) user.name = patch.name;
    if (patch.email !== undefined) user.email = patch.email.toLowerCase();
    if (patch.isActive !== undefined) user.isActive = patch.isActive;
    return this.users.save(user);
  }

  toPublic(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}

export type PublicUser = ReturnType<UsersService['toPublic']>;
