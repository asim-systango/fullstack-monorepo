import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { MembersService } from './members.service';

@ApiTags('members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Roles('staff', 'admin')
  @Get(':userId')
  @ApiOperation({ summary: 'Get member profile by gateway user id' })
  findByUserId(@Param('userId') userId: string) {
    return this.membersService.findByUserId(userId);
  }
}
