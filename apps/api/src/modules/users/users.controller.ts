import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LookupUserDto } from '../groups/dto/lookup-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiCookieAuth('access_token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('lookup')
  @ApiOperation({ summary: 'Look up a registered user by email (invite flow)' })
  async lookup(@Query() query: LookupUserDto) {
    const user = await this.usersService.findByEmail(query.email);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
