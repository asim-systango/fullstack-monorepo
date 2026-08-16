import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../database/repositories/UserRepository';
import { UserEntity, UserRole } from '../../database/entities/UserEntity';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
  }): Promise<UserEntity> {
    return this.userRepository.create(data);
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }
}
