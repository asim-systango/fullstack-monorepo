import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

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
      relations: ['role', 'organization'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email: email.toLowerCase() },
      relations: ['role', 'organization'],
    });
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    return this.userRepo.find({
      where: { organizationId },
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  async createAndSave(data: Partial<User>): Promise<User> {
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
    await this.userRepo.update(id, {
      ...data,
      updatedAt: Date.now(),
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepo.update(id, {
      lastLoginAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async markPasswordChanged(id: string): Promise<void> {
    await this.userRepo.update(id, {
      isPasswordChangeRequired: false,
      updatedAt: Date.now(),
    });
  }
}
