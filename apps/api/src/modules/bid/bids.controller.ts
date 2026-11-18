import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public, Roles, type JwtUser } from '../../common/auth';
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
  listBids(@Param('id', ParseUUIDPipe) id: string) {
    return this.bidsService.listBids(id);
  }

  @Roles('user')
  @Post()
  @ApiOperation({ summary: 'Place a bid on an auction (bidder / user only)' })
  placeBid(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateBidDto,
  ) {
    return this.bidsService.placeBid(id, user.id, dto);
  }
}
