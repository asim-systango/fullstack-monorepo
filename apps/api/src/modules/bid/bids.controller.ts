import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';

@ApiTags('bids')
@ApiBearerAuth()
@Controller('auctions/:id/bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

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
