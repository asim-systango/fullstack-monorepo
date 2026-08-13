import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { CreateEditorDto } from './dto/create-editor.dto';
import { UsersService } from '../users';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

@Injectable()
export class AdminService {
  constructor(private readonly usersService: UsersService) {}

  async listUsers() {
    const users = await this.usersService.listPublic();
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
      return this.usersService.toPublic(user);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Unable to create editor with those details');
      }
      throw err;
    }
  }
}
