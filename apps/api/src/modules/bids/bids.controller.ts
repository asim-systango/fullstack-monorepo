import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public, Roles, type JwtUser } from '../../common/auth';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';

@ApiTags('bids')
@ApiBearerAuth()
@Controller('auctions/:id/bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List bids for an auction (highest first)' })
  listBids(@Param('id', ParseUUIDPipe) id: string, @Query() query: PaginationQueryDto) {
    return this.bidsService.listBids(id, query);
  }

  @Roles('user')
  @Post()
  @ApiOperation({
    summary: 'Place a bid (bidder role only; own-auction bids blocked by service)',
  })
  placeBid(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateBidDto,
  ) {
    return this.bidsService.placeBid(id, user.id, dto);
  }
}

@ApiTags('bids')
@ApiBearerAuth()
@Controller('bids')
export class MyBidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Roles('user')
  @Get('me')
  @ApiOperation({ summary: 'Get my bids (one row per auction with status badge)' })
  getMyBids(@CurrentUser() user: JwtUser, @Query() query: PaginationQueryDto) {
    return this.bidsService.myBids(user.id, query);
  }
}
