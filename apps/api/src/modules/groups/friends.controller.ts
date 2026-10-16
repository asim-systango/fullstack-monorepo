import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth';
import type { PublicUser } from '../users';
import { GroupsService } from './groups.service';

@ApiTags('friends')
@ApiCookieAuth('access_token')
@Controller('friends')
export class FriendsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({
    summary: 'List people shared across your groups (paginated)',
  })
  list(
    @CurrentUser() user: PublicUser,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('q') q: string | undefined,
    @Query('groupId') groupId: string | undefined,
    @Query('view') view: 'groups' | 'people' | undefined,
  ) {
    return this.groupsService.listFriends(user, {
      limit,
      page,
      q,
      groupId,
      view,
    });
  }
}
