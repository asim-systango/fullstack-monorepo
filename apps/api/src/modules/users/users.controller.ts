import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from '../../common/auth';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    const users = await this.usersService.getAllUsers();
    return { data: users };
  }

  @Get(':id')
  @Roles('admin', 'staff')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { data: user };
  }
}
