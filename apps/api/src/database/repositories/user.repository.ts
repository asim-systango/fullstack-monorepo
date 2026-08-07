import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  getRepo(): Repository<User> {
    return this.userRepo;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createAndSave(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    await this.userRepo.update(id, {
      ...data,
      updatedAt: Date.now(),
    });
  }

  async updateRole(id: string, role: UserRole): Promise<void> {
    await this.userRepo.update(id, {
      role,
      updatedAt: Date.now(),
    });
  }

  async updateActiveStatus(id: string, isActive: boolean): Promise<void> {
    await this.userRepo.update(id, {
      isActive,
      updatedAt: Date.now(),
    });
  }
}
