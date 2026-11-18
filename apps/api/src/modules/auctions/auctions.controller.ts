import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';

@ApiTags('auctions')
@ApiBearerAuth()
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Roles('staff')
  @Post()
  @ApiOperation({ summary: 'Create an auction (seller / staff only)' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateAuctionDto) {
    return this.auctionsService.create(dto, user.id);
  }
}
