import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserRole } from './user-role.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email: email.toLocaleLowerCase() } });
  }

  findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async create(input: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
    mustChangePassword?: boolean;
  }) {
    const user = this.userRepo.create({
      email: input.email.toLocaleLowerCase(),
      password_hash: input.passwordHash,
      name: input.name,
      role: input.role ?? UserRole.USER,
      mustChangePassword: input.mustChangePassword ?? false,
    });
    return this.userRepo.save(user);
  }

  async updatePassword(
    userId: string,
    passwordHash: string,
    mustChangePassword: boolean,
  ) {
    await this.userRepo.update(userId, {
      password_hash: passwordHash,
      mustChangePassword,
    });
    return this.findById(userId);
  }

  toPublic(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };
  }
}

export type PublicUser = ReturnType<UsersService['toPublic']>;
