import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('by-email')
  @Roles('staff', 'user', 'admin')
  @ApiOperation({ summary: 'Lookup a gateway user by email (for project invites)' })
  async byEmail(@Query('email') email: string) {
    const normalized = email?.trim().toLowerCase();
    if (!normalized) {
      throw new NotFoundException('No user found with that email');
    }
    const user = await this.usersService.findByEmail(normalized);
    if (!user) {
      throw new NotFoundException('No user found with that email');
    }
    return this.usersService.toPublic(user);
  }

  @Get(':id')
  @Roles('staff', 'user', 'admin')
  @ApiOperation({ summary: 'Lookup a gateway user by id' })
  async byId(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersService.toPublic(user);
  }
}
