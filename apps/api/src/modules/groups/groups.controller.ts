import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/auth';
import type { PublicUser } from '../users';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { GroupsService } from './groups.service';

@ApiTags('groups')
@ApiCookieAuth('access_token')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a group (any authenticated user becomes group admin)',
  })
  create(@Body() dto: CreateGroupDto, @CurrentUser() user: PublicUser) {
    return this.groupsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List groups for current user (paginated)' })
  findAll(
    @CurrentUser() user: PublicUser,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('q') q: string | undefined,
    @Query('status')
    status:
      | 'all'
      | 'outstanding'
      | 'settled'
      | 'blocked'
      | 'owed_to_me'
      | 'i_owe'
      | 'admin'
      | 'member'
      | undefined,
    @Query('sortBy') sortBy: 'updatedAt' | 'name' | 'balance' | undefined,
    @Query('sortDir') sortDir: 'ASC' | 'DESC' | undefined,
  ) {
    return this.groupsService.findAll(user, {
      limit,
      page,
      q,
      status,
      sortBy,
      sortDir,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Group detail with members' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: PublicUser) {
    return this.groupsService.findOne(id, user);
  }

  @Post(':id/invites')
  @ApiOperation({ summary: 'Send a group invite by email (any group member)' })
  sendInvite(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateInviteDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.groupsService.sendInvite(id, dto.email, user);
  }

  @Get(':id/invites')
  @ApiOperation({ summary: 'List pending invitations (group members)' })
  listInvites(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: PublicUser) {
    return this.groupsService.listGroupInvites(id, user);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member (in-group admin only)' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.groupsService.removeMember(id, userId, user);
  }

  @Post(':id/block')
  @Roles('admin')
  @ApiOperation({ summary: 'Block a group (platform admin)' })
  block(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: PublicUser) {
    return this.groupsService.blockGroup(id, user);
  }

  @Post(':id/unblock')
  @Roles('admin')
  @ApiOperation({ summary: 'Unblock a group (platform admin)' })
  unblock(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: PublicUser) {
    return this.groupsService.unblockGroup(id, user);
  }
}
