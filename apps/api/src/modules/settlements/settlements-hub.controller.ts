import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth';
import type { PublicUser } from '../users';
import { SettlementsService } from './settlements.service';

@ApiTags('settlements')
@ApiCookieAuth('access_token')
@Controller('settlements')
export class SettlementsHubController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get()
  @ApiOperation({ summary: 'Paginated settlement history across your groups' })
  list(
    @CurrentUser() user: PublicUser,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('q') q: string | undefined,
    @Query('groupId') groupId: string | undefined,
  ) {
    return this.settlementsService.listForUser(user, { limit, page, q, groupId });
  }
}
