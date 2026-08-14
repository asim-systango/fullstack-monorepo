import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/auth';
import type { PublicUser } from '../users';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupsService } from './groups.service';

@ApiTags('groups')
@ApiCookieAuth('access_token')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles('staff', 'admin')
  @ApiOperation({ summary: 'Create a group (staff or platform admin)' })
  create(@Body() dto: CreateGroupDto, @CurrentUser() user: PublicUser) {
    return this.groupsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List groups for current user' })
  findAll(@CurrentUser() user: PublicUser) {
    return this.groupsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Group detail with members' })
  findOne(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.groupsService.findOne(id, user);
  }
}
