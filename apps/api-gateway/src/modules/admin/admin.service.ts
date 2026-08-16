import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { CreateEditorDto } from './dto/create-editor.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from '../users';
import type { User } from '../users/user.entity';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

@Injectable()
export class AdminService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Wider than `toPublic`: the admin console needs the join date and the active
   * flag, neither of which belongs in the session payload sent to every client.
   */
  private toAdminView(user: User) {
    return {
      ...this.usersService.toPublic(user),
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async listUsers() {
    const found = await this.usersService.findAll();
    const users = found.map((user) => this.toAdminView(user));
    const [authors, editors, admins] = await Promise.all([
      this.usersService.countByRole('user'),
      this.usersService.countByRole('staff'),
      this.usersService.countByRole('admin'),
    ]);

    return {
      users,
      counts: {
        total: users.length,
        authors,
        editors,
        admins,
      },
    };
  }

  async createEditor(dto: CreateEditorDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Unable to create editor with those details');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    try {
      const user = await this.usersService.create({
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: 'staff',
      });
      return this.toAdminView(user);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Unable to create editor with those details');
      }
      throw err;
    }
  }

  /**
   * Admin accounts are out of scope on purpose: refusing them stops an admin
   * locking themselves out and stops the last admin being deactivated, without
   * needing a separate self-check or a count of remaining admins.
   */
  async updateUser(id: string, dto: UpdateUserDto) {
    if (dto.name === undefined && dto.email === undefined && dto.isActive === undefined) {
      throw new BadRequestException('Provide at least one field to update');
    }

    const target = await this.usersService.findById(id);
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (target.role === 'admin') {
      throw new ForbiddenException('Admin accounts cannot be changed from here');
    }

    try {
      const updated = await this.usersService.update(target, dto);
      return this.toAdminView(updated);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('That email is already taken');
      }
      throw err;
    }
  }
}
