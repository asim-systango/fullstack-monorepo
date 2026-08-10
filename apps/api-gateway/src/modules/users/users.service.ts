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

  async create(input: { email: string; passwordHash: string; name: string }) {
    const user = this.userRepo.create({
      email: input.email.toLocaleLowerCase(),
      password_hash: input.passwordHash,
      name: input.name,
      role: UserRole.USER,
    });
    return this.userRepo.save(user);
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
