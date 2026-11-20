import { Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { WatchlistService } from './watchlist.service';

@ApiTags('watchlist')
@ApiBearerAuth()
@Controller('auctions/:id/watch')
export class AuctionWatchController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Roles('user', 'staff')
  @Post()
  @ApiOperation({ summary: 'Add auction to watchlist' })
  addWatch(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.watchlistService.addWatch(id, user.id);
  }

  @Roles('user', 'staff')
  @Delete()
  @ApiOperation({ summary: 'Remove auction from watchlist' })
  removeWatch(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.watchlistService.removeWatch(id, user.id);
  }
}

@ApiTags('watchlist')
@ApiBearerAuth()
@Controller('users/me')
export class MyWatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Roles('user', 'staff')
  @Get('watchlist')
  @ApiOperation({ summary: "Get authenticated user's watchlist" })
  getMyWatchlist(@CurrentUser() user: JwtUser) {
    return this.watchlistService.getMyWatchlist(user.id);
  }
}
